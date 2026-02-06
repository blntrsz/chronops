import { Actor, Pdf } from "@chronops/domain";
import { and, eq, isNull } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { Database } from "../db";
import { StorageService } from "../storage/service";
import { pdfTable } from "./sql";
import { pdfPageTable } from "../pdf-page/sql";
import * as PdfPageService from "../pdf-page/service";

/**
 * Service for managing PDF documents and their processing lifecycle.
 * @since 1.0.0
 * @category service
 */
export class PdfService extends Effect.Service<PdfService>()("PdfService", {
  effect: Effect.gen(function* () {
    const { use, tables } = yield* Database;
    const storage = yield* StorageService;
    const pdfPageService = yield* PdfPageService.PdfPageService;

    /**
     * Get a PDF by its ID.
     * @since 1.0.0
     * @category service-method
     */
    const getById = Effect.fn(function* (id: Schema.Schema.Type<typeof Pdf.PdfId>) {
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
      const model = yield* Pdf.make(input);
      yield* use((db) => db.insert(tables.pdf).values(model));

      const uploadUrl = yield* storage.getSignedUploadUrl(model.storageKey, model.contentType);

      return {
        pdfId: model.id,
        uploadUrl,
        storageKey: model.storageKey,
      };
    });

    /**
     * Start processing a PDF by marking it as processing and forking a background job.
     * @since 1.0.0
     * @category service-method
     */
    const startProcessing = Effect.fn(function* (id: Schema.Schema.Type<typeof Pdf.PdfId>) {
      const model = yield* getById(id);
      const processingModel = yield* Pdf.markProcessing(model);
      yield* use((db) => db.insert(tables.pdf).values(processingModel));

      yield* Effect.forkDaemon(processPdf(id));
    });

    /**
     * Process a PDF by extracting text from all pages.
     * Handles errors gracefully by marking PDF as failed.
     * @since 1.0.0
     * @category service-method
     * @private
     */
    const processPdf = Effect.fn(function* (id: Schema.Schema.Type<typeof Pdf.PdfId>) {
      const process = Effect.gen(function* () {
        const model = yield* getById(id);

        yield* Effect.log(`Processing PDF ${id}`);

        const pages = yield* pdfPageService.processPdfPages(model);

        const readyModel = yield* Pdf.markReady(model, pages.length);
        yield* use((db) => db.insert(tables.pdf).values(readyModel));

        yield* Effect.log(`PDF ${id} processed successfully with ${pages.length} pages`);
      });

      const result = yield* Effect.either(process);

      if (Effect.isLeft(result)) {
        yield* Effect.logError(`Failed to process PDF ${id}: ${result.left}`);

        const model = yield* getById(id);
        const failedModel = yield* Pdf.markFailed(model);
        yield* use((db) => db.insert(tables.pdf).values(failedModel));

        return;
      }
    });

    /**
     * Soft delete a PDF and all its pages.
     * @since 1.0.0
     * @category service-method
     */
    const remove = Effect.fn(function* (id: Schema.Schema.Type<typeof Pdf.PdfId>) {
      const model = yield* getById(id);

      const removedModel = yield* Pdf.remove(model);
      yield* use((db) => db.insert(tables.pdf).values(removedModel));

      yield* use((db) =>
        db
          .update(tables.pdfPage)
          .set({
            deletedAt: removedModel.deletedAt,
            deletedBy: removedModel.deletedBy,
            hash: removedModel.hash,
          })
          .where(eq(tables.pdfPage.pdfId, id)),
      );
    });

    return {
      getById,
      getUploadUrl,
      startProcessing,
      remove,
    };
  }),
}) {}
