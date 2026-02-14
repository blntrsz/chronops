import { Actor, Base, EntityType, Event, Pdf, PdfPage } from "@chronops/domain";
import { and, eq, isNull } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { Database } from "../db";
import { EventService } from "../common/service/event-service";
import { StorageService } from "../storage/service";
import { TicketService } from "../ticket/service";
import { resolvePDFJS } from "pdfjs-serverless";

/**
 * Service for managing PDF documents and their processing lifecycle.
 * @since 1.0.0
 * @category service
 */
export class PdfService extends Effect.Service<PdfService>()("PdfService", {
  dependencies: [
    Base.ULID.Default,
    Database.Default,
    StorageService.Default,
    EventService.Default,
    TicketService.Default,
  ],
  effect: Effect.gen(function* () {
    const { use, tables } = yield* Database;
    const storage = yield* StorageService;
    const eventService = yield* EventService;
    const ticketService = yield* TicketService;

    /**
     * Get a PDF by its ID.
     * @since 1.0.0
     * @category service-method
     */
    const getById = Effect.fn(function* (
      id: Schema.Schema.Type<typeof Pdf.PdfId>,
    ) {
      const actor = yield* Actor.Actor;
      const model = yield* use((db) =>
        db.query.pdf.findFirst({
          where: and(
            eq(tables.pdf.id, id),
            eq(tables.pdf.orgId, actor.orgId),
            isNull(tables.pdf.deletedAt),
          ),
        }),
      );
      if (!model) {
        throw yield* Pdf.PdfNotFoundError.fromId(id);
      }

      return Pdf.Pdf.make(model);
    });

    /**
     * Create a new PDF record and generate a signed upload URL.
     * @since 1.0.0
     * @category service-method
     */
    const getUploadUrl = Effect.fn(function* (
      input: Schema.Schema.Type<typeof Pdf.CreatePdf>,
    ) {
      const actor = yield* Actor.Actor;
      const ticket = yield* ticketService.next(
        actor.orgId,
        Base.TicketPrefix.make("PDF"),
      );
      const model = yield* Pdf.make({ ...input, ticket } as Pdf.CreatePdfInput);
      yield* use((db) => db.insert(tables.pdf).values(model));
      const event = yield* Event.make({
        name: Pdf.Event.created,
        entityId: model.id,
        entityType: EntityType.Pdf,
        revisionId: model.revisionId,
        revisionIdBefore: null,
      });
      yield* eventService.append(event);

      const uploadUrl = yield* storage.getSignedUploadUrl(
        model.storageKey,
        model.contentType,
      );

      return {
        pdfId: model.id,
        uploadUrl,
        storageKey: model.storageKey,
        storageProvider: model.storageProvider,
      };
    });

    /**
     * Start processing a PDF by marking it as processing and forking a background job.
     * @since 1.0.0
     * @category service-method
     */
    const startProcessing = Effect.fn(function* (
      id: Schema.Schema.Type<typeof Pdf.PdfId>,
    ) {
      const model = yield* getById(id);
      const processingModel = yield* Pdf.markProcessing(model).pipe(
        Effect.catchAll(() =>
          Effect.succeed({ ...model, status: "processing" as const }),
        ),
      );
      yield* use((db) => db.insert(tables.pdf).values(processingModel));

      const processingEvent = yield* Event.make({
        name: Pdf.Event.updated,
        entityId: processingModel.id,
        entityType: EntityType.Pdf,
        revisionId: processingModel.revisionId,
        revisionIdBefore: model.revisionId,
      });
      yield* eventService.append(processingEvent);

      yield* Effect.forkDaemon(processPdf(id));
    });

    /**
     * Process a PDF by extracting text from all pages.
     * Handles errors gracefully by marking PDF as failed.
     * @since 1.0.0
     * @category service-method
     * @private
     */
    const processPdf = Effect.fn(function* (
      id: Schema.Schema.Type<typeof Pdf.PdfId>,
    ) {
      const process = Effect.gen(function* () {
        const model = yield* getById(id);

        yield* Effect.log(`Processing PDF ${id}`);

        const pages = yield* processPdfPages(model);

        const readyModel = yield* Pdf.markReady(model, pages.length).pipe(
          Effect.catchAll(() =>
            Effect.succeed({
              ...model,
              status: "ready" as const,
              pageCount: pages.length,
            }),
          ),
        );
        yield* use((db) => db.insert(tables.pdf).values(readyModel));

        const readyEvent = yield* Event.make({
          name: Pdf.Event.updated,
          entityId: readyModel.id,
          entityType: EntityType.Pdf,
          revisionId: readyModel.revisionId,
          revisionIdBefore: model.revisionId,
        });
        yield* eventService.append(readyEvent);

        yield* Effect.log(
          `PDF ${id} processed successfully with ${pages.length} pages`,
        );
      });

      const result = yield* Effect.either(process);

      if (result._tag === "Left") {
        yield* Effect.logError(`Failed to process PDF ${id}: ${result.left}`);

        const model = yield* getById(id);
        const failedModel = yield* Pdf.markFailed(model).pipe(
          Effect.catchAll(() =>
            Effect.succeed({ ...model, status: "failed" as const }),
          ),
        );
        yield* use((db) => db.insert(tables.pdf).values(failedModel));

        const failedEvent = yield* Event.make({
          name: Pdf.Event.updated,
          entityId: failedModel.id,
          entityType: EntityType.Pdf,
          revisionId: failedModel.revisionId,
          revisionIdBefore: model.revisionId,
        });
        yield* eventService.append(failedEvent);

        return;
      }
    });

    /**
     * Soft delete a PDF and all its pages.
     * @since 1.0.0
     * @category service-method
     */
    const remove = Effect.fn(function* (
      id: Schema.Schema.Type<typeof Pdf.PdfId>,
    ) {
      const model = yield* getById(id);

      const removedModel = yield* Pdf.remove(model);
      yield* use((db) => db.insert(tables.pdf).values(removedModel));
      const event = yield* Event.make({
        name: Pdf.Event.deleted,
        entityId: removedModel.id,
        entityType: EntityType.Pdf,
        revisionId: removedModel.revisionId,
        revisionIdBefore: model.revisionId,
      });
      yield* eventService.append(event);

      yield* use((db) =>
        db
          .update(tables.pdfPage)
          .set({
            deletedAt: removedModel.deletedAt,
            deletedBy: removedModel.deletedBy,
            revisionId: removedModel.revisionId,
          })
          .where(eq(tables.pdfPage.pdfId, id)),
      );
    });

    /**
     * Get a specific page by PDF ID and page number.
     * @since 1.0.0
     * @category service-method
     */
    const getPage = Effect.fn(function* (
      pdfId: Schema.Schema.Type<typeof Pdf.PdfId>,
      pageNumber: number,
    ) {
      const actor = yield* Actor.Actor;
      const model = yield* use((db) =>
        db.query.pdfPage.findFirst({
          where: and(
            eq(tables.pdfPage.pdfId, pdfId),
            eq(tables.pdfPage.pageNumber, pageNumber),
            eq(tables.pdfPage.orgId, actor.orgId),
            isNull(tables.pdfPage.deletedAt),
          ),
        }),
      );
      if (!model) {
        throw yield* PdfPage.PdfPageNotFoundError.fromId(
          PdfPage.PdfPageId.make(`${pdfId}_${pageNumber}`),
        );
      }

      return PdfPage.PdfPage.make(model);
    });

    /**
     * List all pages for a PDF, ordered by page number.
     * @since 1.0.0
     * @category service-method
     */
    const listByPdfId = Effect.fn(function* (
      pdfId: Schema.Schema.Type<typeof Pdf.PdfId>,
    ) {
      const actor = yield* Actor.Actor;
      const models = yield* use((db) =>
        db.query.pdfPage.findMany({
          where: and(
            eq(tables.pdfPage.pdfId, pdfId),
            eq(tables.pdfPage.orgId, actor.orgId),
            isNull(tables.pdfPage.deletedAt),
          ),
          orderBy: (page, { asc }) => [asc(page.pageNumber)],
        }),
      );

      return models.map((model) => PdfPage.PdfPage.make(model));
    });

    /**
     * Process all pages of a PDF, extracting text content from each.
     * @since 1.0.0
     * @category service-method
     */
    const processPdfPages = Effect.fn(function* (pdf: Pdf.Pdf) {
      yield* Effect.log(`Fetching PDF ${pdf.id} from S3`);

      const s3Object = yield* storage.getObject(pdf.storageKey);

      const arrayBuffer = (yield* Effect.tryPromise(() =>
        (
          s3Object.Body as { transformToByteArray: () => Promise<Uint8Array> }
        ).transformToByteArray(),
      ).pipe(
        Effect.mapError(
          (error: unknown) => new Error(`Failed to read PDF data: ${error}`),
        ),
      )) as Uint8Array;

      const pdfjs = yield* Effect.tryPromise({
        try: () => resolvePDFJS(),
        catch: (error) => Pdf.PdfProcessingError.libraryInitFailed(error),
      });

      const pdfDocument = (yield* Effect.tryPromise(
        () =>
          pdfjs.getDocument({ data: arrayBuffer as Uint8Array })
            .promise as Promise<{
            numPages: number;
            getPage: (pageNumber: number) => Promise<{
              getTextContent: () => Promise<{ items: Array<{ str: string }> }>;
            }>;
          }>,
      ).pipe(
        Effect.mapError(
          (error: unknown) => new Error(`Failed to parse PDF: ${error}`),
        ),
      )) as {
        numPages: number;
        getPage: (pageNumber: number) => Promise<{
          getTextContent: () => Promise<{ items: Array<{ str: string }> }>;
        }>;
      };

      const numPages = pdfDocument.numPages;
      yield* Effect.log(`PDF has ${numPages} pages`);

      const pageNumbers = Array.from({ length: numPages }, (_, i) => i + 1);

      const pages = yield* Effect.forEach(
        pageNumbers,
        (pageNum) =>
          Effect.gen(function* () {
            yield* Effect.log(`Processing page ${pageNum}/${numPages}`);

            const page = yield* Effect.tryPromise({
              try: () => pdfDocument.getPage(pageNum),
              catch: (error: unknown) =>
                new Error(`Failed to get page ${pageNum}: ${error}`),
            });

            const textContent = yield* Effect.tryPromise({
              try: async () => {
                const content = await page.getTextContent();
                return content.items
                  .map((item: { str: string }) => item.str)
                  .join(" ");
              },
              catch: (error: unknown) =>
                new Error(
                  `Failed to extract text from page ${pageNum}: ${error}`,
                ),
            });

            const pdfPage = yield* PdfPage.make({
              pdfId: pdf.id,
              pageNumber: pageNum,
              storageKey: `${pdf.storageKey}/page-${pageNum}`,
              storageProvider: pdf.storageProvider,
              ticket: yield* ticketService.next(
                (yield* Actor.Actor).orgId,
                Base.TicketPrefix.make("PG"),
              ),
            });

            const pdfPageWithText = yield* PdfPage.updateText(
              pdfPage,
              textContent,
            );

            yield* use((db) =>
              db.insert(tables.pdfPage).values(pdfPageWithText),
            );
            const event = yield* Event.make({
              name: PdfPage.Event.created,
              entityId: pdfPageWithText.id,
              entityType: EntityType.PdfPage,
              revisionId: pdfPageWithText.revisionId,
              revisionIdBefore: null,
            });
            yield* eventService.append(event);

            return pdfPageWithText;
          }),
        { concurrency: 1 },
      );

      return pages;
    });

    return {
      getById,
      getUploadUrl,
      startProcessing,
      remove,

      getPage,
      listByPdfId,
      processPdfPages,
    };
  }),
}) {}
