import { Control, Evidence, Pdf } from "@chronops/domain";
import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";
import { ParseError } from "effect/ParseResult";
import { AuthMiddleware } from "../auth/middleware-interface";
import { Pagination } from "../common/repository";
import { DatabaseError } from "../db-error";
import { Paginated } from "../common/pagination";

export class EvidenceContract extends RpcGroup.make(
  Rpc.make("EvidenceCreate", {
    success: Evidence.Evidence,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
    payload: Evidence.CreateEvidence,
  }),
  Rpc.make("EvidenceById", {
    success: Evidence.Evidence,
    error: Schema.Union(
      DatabaseError,
      Schema.instanceOf(ParseError),
      Evidence.EvidenceNotFoundError,
    ),
    payload: { id: Evidence.EvidenceId },
  }),
  Rpc.make("EvidenceList", {
    success: Paginated(Evidence.Evidence),
    payload: Pagination.pipe(
      Schema.extend(
        Schema.Struct({
          controlId: Schema.optional(Control.ControlId),
          pdfId: Schema.optional(Pdf.PdfId),
        }),
      ),
    ),
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
  }),
  Rpc.make("EvidenceUpdate", {
    success: Evidence.Evidence,
    error: Schema.Union(
      DatabaseError,
      Schema.instanceOf(ParseError),
      Evidence.EvidenceNotFoundError,
    ),
    payload: {
      id: Evidence.EvidenceId,
      data: Evidence.UpdateEvidence,
    },
  }),
  Rpc.make("EvidenceRemove", {
    success: Schema.Void,
    error: Schema.Union(
      DatabaseError,
      Schema.instanceOf(ParseError),
      Evidence.EvidenceNotFoundError,
    ),
    payload: { id: Evidence.EvidenceId },
  }),
).middleware(AuthMiddleware) {}
