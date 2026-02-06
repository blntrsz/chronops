import { Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Base from "./base";
import * as Pdf from "./pdf";

/**
 * Branded type for PDF page identifiers.
 * @since 1.0.0
 * @category types
 */
export const PdfPageId = Schema.String.pipe(Schema.brand("PdfPageId"));
export type PdfPageId = typeof PdfPageId.Type;

/**
 * Generate a new PdfPageId.
 * @since 1.0.0
 */
export const pdfPageId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return PdfPageId.make(`pg_${createId()}`);
});

/**
 * PDF page model containing extracted text content.
 * @since 1.0.0
 * @category models
 */
export class PdfPage extends Base.Base.extend<PdfPage>("PdfPage")({
  id: PdfPageId,
  pdfId: Pdf.PdfId,
  pageNumber: Schema.Number,
  textContent: Schema.String,
  storageKey: Schema.String,
}) {}

/**
 * Schema for creating a new PDF page.
 * @since 1.0.0
 * @category schemas
 */
export const CreatePdfPage = Schema.Struct({
  pdfId: Pdf.PdfId,
  pageNumber: Schema.Number,
  storageKey: Schema.String,
});
export type CreatePdfPage = typeof CreatePdfPage.Type;

/**
 * Create a new PDF page entity.
 * @since 1.0.0
 */
export const make = Effect.fn(function* (input: CreatePdfPage) {
  const base = yield* Base.makeBase();

  return PdfPage.make({
    id: yield* pdfPageId(),
    textContent: "",
    ...input,
    ...base,
  });
});

/**
 * Update the text content of a PDF page.
 * @since 1.0.0
 */
export const updateText = Effect.fn(function* (model: PdfPage, textContent: string) {
  const base = yield* Base.updateBase();

  return PdfPage.make({
    ...model,
    textContent,
    ...base,
  });
});

/**
 * Soft remove a PDF page.
 * @since 1.0.0
 */
export const remove = Effect.fn(function* (model: PdfPage) {
  const base = yield* Base.removeBase();

  return PdfPage.make({
    ...model,
    ...base,
  });
});

/**
 * PDF page not found error.
 * @since 1.0.0
 * @category errors
 */
export class PdfPageNotFoundError extends Base.NotFoundError {
  static override fromId(id: PdfPageId) {
    return new PdfPageNotFoundError({
      message: `PdfPage with id ${id} not found.`,
      entityType: "PdfPage",
      entityId: id,
    });
  }
}
