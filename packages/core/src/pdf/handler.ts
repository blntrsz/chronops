import { Effect, Layer } from "effect";
import { PdfContract } from "./contract";
import { PdfService } from "./service";

/**
 * RPC handler layer for PDF operations.
 * Maps RPC contract methods to service implementations.
 * @since 1.0.0
 * @category handlers
 */
export const PdfHandler = PdfContract.toLayer(
  Effect.gen(function* () {
    const service = yield* PdfService;

    return {
      PdfGetUploadUrl: (payload) => service.getUploadUrl(payload),
      PdfStartProcessing: ({ pdfId }) => service.startProcessing(pdfId),
      PdfById: ({ pdfId }) => service.getById(pdfId),
      PdfPageByNumber: ({ pdfId, pageNumber }) => service.getPage(pdfId, pageNumber),
      PdfPagesList: ({ pdfId }) => service.listByPdfId(pdfId),
      PdfRemove: ({ pdfId }) => service.remove(pdfId),
    };
  }),
).pipe(Layer.provide(PdfService.Default));
