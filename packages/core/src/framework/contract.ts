import { Audit, Framework, FrameworkSummary } from "@chronops/domain";
import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";
import { ParseError } from "effect/ParseResult";
import { AuthMiddleware } from "../auth/middleware-interface";
import { Pagination } from "../common/repository";
import { DatabaseError } from "../db-error";
import { Paginated } from "../common/pagination";

const AuditFrameworkLink = Schema.Struct({
  auditId: Audit.AuditId,
  frameworkId: Framework.FrameworkId,
  createdAt: Schema.DateTimeUtc,
});

export class FrameworkContract extends RpcGroup.make(
  Rpc.make("FrameworkCreate", {
    success: Framework.Framework,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
    payload: Framework.CreateFramework,
  }),
  Rpc.make("FrameworkById", {
    success: Framework.Framework,
    error: Schema.Union(
      DatabaseError,
      Schema.instanceOf(ParseError),
      Framework.FrameworkNotFoundError,
    ),
    payload: { id: Framework.FrameworkId },
  }),
  Rpc.make("FrameworkList", {
    success: Paginated(Framework.Framework),
    payload: Pagination,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
  }),
  Rpc.make("FrameworkUpdate", {
    success: Framework.Framework,
    error: Schema.Union(
      DatabaseError,
      Schema.instanceOf(ParseError),
      Framework.FrameworkNotFoundError,
    ),
    payload: {
      id: Framework.FrameworkId,
      data: Framework.UpdateFramework,
    },
  }),
  Rpc.make("FrameworkRemove", {
    success: Schema.Void,
    error: Schema.Union(
      DatabaseError,
      Schema.instanceOf(ParseError),
      Framework.FrameworkNotFoundError,
    ),
    payload: { id: Framework.FrameworkId },
  }),
  Rpc.make("FrameworkSummaryList", {
    success: Schema.Array(FrameworkSummary.FrameworkSummary),
    payload: {},
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
  }),
  Rpc.make("AuditFrameworkLink", {
    success: Schema.Void,
    payload: { auditId: Audit.AuditId, frameworkId: Framework.FrameworkId },
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
  }),
  Rpc.make("AuditFrameworkUnlink", {
    success: Schema.Void,
    payload: { auditId: Audit.AuditId, frameworkId: Framework.FrameworkId },
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
  }),
  Rpc.make("AuditFrameworkList", {
    success: Schema.Array(AuditFrameworkLink),
    payload: Schema.Struct({
      frameworkId: Schema.optional(Framework.FrameworkId),
      auditId: Schema.optional(Audit.AuditId),
    }),
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
  }),
).middleware(AuthMiddleware) {}
