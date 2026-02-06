import { Effect } from "effect";
import { PdfContract } from "./contract";
import { PdfService } from "./service";
import { PdfPageService } from "../pdf-page/service";

/**
 * RPC handler layer for PDF operations.
 * Maps RPC contract methods to service implementations.
 * @since 1.0.0
 * @category handlers
 */
export const PdfHandler = PdfContract.toLayer(
  Effect.gen(function* () {
    const pdfService = yield* PdfService;
    const pdfPageService = yield* PdfPageService;

    return {
      PdfGetUploadUrl: (payload) => pdfService.getUploadUrl(payload),
      PdfStartProcessing: ({ pdfId }) => pdfService.startProcessing(pdfId),
      PdfById: ({ pdfId }) => pdfService.getById(pdfId),
      PdfPageByNumber: ({ pdfId, pageNumber }) => pdfPageService.getPage(pdfId, pageNumber),
      PdfPagesList: ({ pdfId }) => pdfPageService.listByPdfId(pdfId),
      PdfRemove: ({ pdfId }) => pdfService.remove(pdfId),
    };
  }),
);
