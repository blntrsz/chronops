import { Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Base from "./base";

/**
 * Branded type for PDF identifiers.
 * @since 1.0.0
 * @category types
 */
export const PdfId = Schema.String.pipe(Schema.brand("PdfId"));
export type PdfId = typeof PdfId.Type;

/**
 * Generate a new PdfId.
 * @since 1.0.0
 */
export const pdfId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return PdfId.make(Base.buildId("pdf", createId));
});

/**
 * PDF processing statuses.
 * @since 1.0.0
 * @category types
 */
export const PdfStatus = Schema.Union(
  Schema.Literal("uploaded"),
  Schema.Literal("processing"),
  Schema.Literal("ready"),
  Schema.Literal("failed"),
);
export type PdfStatus = typeof PdfStatus.Type;

export const PdfContentType = Schema.Union(
  Schema.Literal("application/pdf"),
  Schema.Literal("application/octet-stream"),
);
export type PdfContentType = typeof PdfContentType.Type;

export const PdfStorageProvider = Schema.Union(
  Schema.Literal("s3"),
  Schema.Literal("local"),
);
export type PdfStorageProvider = typeof PdfStorageProvider.Type;

export const PdfChecksum = Schema.String.pipe(Schema.brand("PdfChecksum"));
export type PdfChecksum = typeof PdfChecksum.Type;

export const PdfPageCount = Schema.Number.pipe(Schema.int(), Schema.greaterThanOrEqualTo(0));
export type PdfPageCount = typeof PdfPageCount.Type;

export const PdfFileSize = Schema.Number.pipe(Schema.int(), Schema.greaterThanOrEqualTo(0));
export type PdfFileSize = typeof PdfFileSize.Type;

/**
 * PDF document model.
 * @since 1.0.0
 * @category models
 */
export class Pdf extends Base.Base.extend<Pdf>("Pdf")({
  id: PdfId,
  title: Schema.String,
  filename: Schema.String,
  fileSize: PdfFileSize,
  contentType: PdfContentType,
  pageCount: PdfPageCount,
  storageKey: Schema.String,
  storageProvider: PdfStorageProvider,
  checksum: PdfChecksum,
  status: PdfStatus,
}) {}

/**
 * Schema for creating a new PDF.
 * @since 1.0.0
 * @category schemas
 */
export const CreatePdf = Schema.Struct({
  title: Schema.String,
  filename: Schema.String,
  fileSize: PdfFileSize,
  contentType: PdfContentType,
  storageKey: Schema.String,
  storageProvider: PdfStorageProvider,
  checksum: PdfChecksum,
});
export type CreatePdf = typeof CreatePdf.Type;

/**
 * Create a new PDF entity.
 * @since 1.0.0
 */
export const make = Effect.fn(function* (input: CreatePdf) {
  const base = yield* Base.makeBase();

  return Pdf.make({
    id: yield* pdfId(),
    pageCount: PdfPageCount.make(0),
    status: "uploaded",
    ...input,
    ...base,
  });
});

/**
 * Mark a PDF as processing.
 * @since 1.0.0
 */
export const markProcessing = Effect.fn(function* (model: Pdf) {
  const base = yield* Base.updateBase();

  return Pdf.make({
    ...model,
    status: "processing",
    ...base,
  });
});

/**
 * Mark a PDF as ready with the extracted page count.
 * @since 1.0.0
 */
export const markReady = Effect.fn(function* (model: Pdf, pageCount: number) {
  const base = yield* Base.updateBase();

  return Pdf.make({
    ...model,
    status: "ready",
    pageCount: PdfPageCount.make(pageCount),
    ...base,
  });
});

/**
 * Mark a PDF as failed.
 * @since 1.0.0
 */
export const markFailed = Effect.fn(function* (model: Pdf) {
  const base = yield* Base.updateBase();

  return Pdf.make({
    ...model,
    status: "failed",
    ...base,
  });
});

/**
 * Soft remove a PDF.
 * @since 1.0.0
 */
export const remove = Effect.fn(function* (model: Pdf) {
  const base = yield* Base.removeBase();

  return Pdf.make({
    ...model,
    ...base,
  });
});

/**
 * PDF not found error.
 * @since 1.0.0
 * @category errors
 */
export class PdfNotFoundError extends Base.NotFoundError {
  static override fromId(id: PdfId) {
    return new PdfNotFoundError({
      message: `Pdf with id ${id} not found.`,
      entityType: "Pdf",
      entityId: id,
    });
  }
}
