import { Pdf, PdfPage } from "@chronops/domain";
import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";
import { ParseError } from "effect/ParseResult";
import { AuthMiddleware } from "../auth/middleware-interface";
import { DatabaseError } from "../db-error";
import { StorageError } from "../storage/service";

/**
 * Response schema for PDF upload URL generation.
 * @since 1.0.0
 * @category schemas
 */
export const PdfUploadResponse = Schema.Struct({
  pdfId: Pdf.PdfId,
  uploadUrl: Schema.String,
  storageKey: Schema.String,
  storageProvider: Pdf.PdfStorageProvider,
});
export type PdfUploadResponse = typeof PdfUploadResponse.Type;

/**
 * RPC contract for PDF operations.
 * @since 1.0.0
 * @category contracts
 */
export class PdfContract extends RpcGroup.make(
  Rpc.make("PdfGetUploadUrl", {
    success: PdfUploadResponse,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError), StorageError),
    payload: Pdf.CreatePdf,
  }),
  Rpc.make("PdfStartProcessing", {
    success: Schema.Void,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError), Pdf.PdfNotFoundError),
    payload: Schema.Struct({
      pdfId: Pdf.PdfId,
    }),
  }),
  Rpc.make("PdfById", {
    success: Pdf.Pdf,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError), Pdf.PdfNotFoundError),
    payload: Schema.Struct({
      pdfId: Pdf.PdfId,
    }),
  }),
  Rpc.make("PdfPageByNumber", {
    success: PdfPage.PdfPage,
    error: Schema.Union(
      DatabaseError,
      Schema.instanceOf(ParseError),
      Pdf.PdfNotFoundError,
      PdfPage.PdfPageNotFoundError,
    ),
    payload: Schema.Struct({
      pdfId: Pdf.PdfId,
      pageNumber: Schema.Number.pipe(Schema.int(), Schema.greaterThanOrEqualTo(1)),
    }),
  }),
  Rpc.make("PdfPagesList", {
    success: Schema.Array(PdfPage.PdfPage),
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError), Pdf.PdfNotFoundError),
    payload: Schema.Struct({
      pdfId: Pdf.PdfId,
    }),
  }),
  Rpc.make("PdfRemove", {
    success: Schema.Void,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError), Pdf.PdfNotFoundError),
    payload: Schema.Struct({
      pdfId: Pdf.PdfId,
    }),
  }),
).middleware(AuthMiddleware) {}
