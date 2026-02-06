import { Actor, Pdf, PdfPage } from "@chronops/domain";
import { and, eq, isNull } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { Database } from "../db";
import { StorageService } from "../storage/service";
import { pdfPageTable } from "./sql";
import * as pdfjs from "pdfjs-serverless";

/**
 * Service for managing PDF page content and text extraction.
 * @since 1.0.0
 * @category service
 */
export class PdfPageService extends Effect.Service<PdfPageService>()("PdfPageService", {
  effect: Effect.gen(function* () {
    const { use, tables } = yield* Database;
    const storage = yield* StorageService;

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
        throw yield* PdfPage.PdfPageNotFoundError.fromId(PdfPage.PdfPageId.make(`${pdfId}_${pageNumber}`));
      }

      return PdfPage.PdfPage.make(model);
    });

    /**
     * List all pages for a PDF, ordered by page number.
     * @since 1.0.0
     * @category service-method
     */
    const listByPdfId = Effect.fn(function* (pdfId: Schema.Schema.Type<typeof Pdf.PdfId>) {
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
    const processPdfPages = Effect.fn(function* (
      pdf: Pdf.Pdf,
    ) {
      yield* Effect.log(`Fetching PDF ${pdf.id} from S3`);

      const s3Object = yield* storage.getObject(pdf.storageKey);

      const arrayBuffer = yield* Effect.tryPromise({
        try: () => s3Object.Body!.transformToByteArray(),
        catch: (error) => new Error(`Failed to read PDF data: ${error}`),
      });

      const pdfDocument = yield* Effect.try({
        try: () => pdfjs.getDocument({ data: arrayBuffer }).promise,
        catch: (error) => new Error(`Failed to parse PDF: ${error}`),
      });

      const numPages = pdfDocument.numPages;
      yield* Effect.log(`PDF has ${numPages} pages`);

      const pageNumbers = Array.from({ length: numPages }, (_, i) => i + 1);

      const pages = yield* Effect.forEach(pageNumbers, (pageNum) =>
        Effect.gen(function* () {
          yield* Effect.log(`Processing page ${pageNum}/${numPages}`);

          const page = yield* Effect.try({
            try: () => pdfDocument.getPage(pageNum),
            catch: (error) => new Error(`Failed to get page ${pageNum}: ${error}`),
          });

          const textContent = yield* Effect.tryPromise({
            try: async () => {
              const content = await page.getTextContent();
              return content.items.map((item: { str: string }) => item.str).join(" ");
            },
            catch: (error) => new Error(`Failed to extract text from page ${pageNum}: ${error}`),
          });

          const pdfPage = yield* PdfPage.make({
            pdfId: pdf.id,
            pageNumber: pageNum,
            storageKey: `${pdf.storageKey}/page-${pageNum}`,
          });

          const pdfPageWithText = yield* PdfPage.updateText(pdfPage, textContent);

          yield* use((db) => db.insert(tables.pdfPage).values(pdfPageWithText));

          return pdfPageWithText;
        }),
        { concurrency: 1 },
      );

      return pages;
    });

    return {
      getPage,
      listByPdfId,
      processPdfPages,
    };
  }),
}) {}
