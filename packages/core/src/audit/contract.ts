import { AssessmentTemplate, Audit, Workflow } from "@chronops/domain";
import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";
import { ParseError } from "effect/ParseResult";
import { AuthMiddleware } from "../auth/middleware-interface";
import { Pagination } from "../common/repository";
import { DatabaseError } from "../db-error";
import { Paginated } from "../common/pagination";

export class AuditContract extends RpcGroup.make(
  Rpc.make("AuditCreate", {
    success: Audit.Audit,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
    payload: Audit.CreateAudit,
  }),
  Rpc.make("AuditById", {
    success: Audit.Audit,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError), Audit.AuditNotFoundError),
    payload: { id: Audit.AuditId },
  }),
  Rpc.make("AuditList", {
    success: Paginated(Audit.Audit),
    payload: Pagination.pipe(
      Schema.extend(
        Schema.Struct({
          assessmentMethodId: Schema.optional(AssessmentTemplate.AssessmentTemplateId),
          status: Schema.optional(Audit.AuditStatus),
        }),
      ),
    ),
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
  }),
  Rpc.make("AuditUpdate", {
    success: Audit.Audit,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError), Audit.AuditNotFoundError),
    payload: { id: Audit.AuditId, data: Audit.UpdateAudit },
  }),
  Rpc.make("AuditRemove", {
    success: Schema.Void,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError), Audit.AuditNotFoundError),
    payload: { id: Audit.AuditId },
  }),
  Rpc.make("AuditRunCreate", {
    success: Audit.AuditRun,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
    payload: Audit.CreateAuditRun,
  }),
  Rpc.make("AuditRunById", {
    success: Audit.AuditRun,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError), Audit.AuditRunNotFoundError),
    payload: { id: Audit.AuditRunId },
  }),
  Rpc.make("AuditRunList", {
    success: Paginated(Audit.AuditRun),
    payload: Pagination.pipe(
      Schema.extend(
        Schema.Struct({
          auditId: Schema.optional(Audit.AuditId),
          assessmentMethodId: Schema.optional(AssessmentTemplate.AssessmentTemplateId),
          status: Schema.optional(Audit.AuditRunStatus),
        }),
      ),
    ),
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
  }),
  Rpc.make("AuditRunStart", {
    success: Audit.AuditRun,
    error: Schema.Union(
      DatabaseError,
      Schema.instanceOf(ParseError),
      Audit.AuditRunNotFoundError,
      Workflow.InvalidEvent,
      Workflow.InvalidState,
      Workflow.InvalidTemplate,
    ),
    payload: { id: Audit.AuditRunId },
  }),
  Rpc.make("AuditRunComplete", {
    success: Audit.AuditRun,
    error: Schema.Union(
      DatabaseError,
      Schema.instanceOf(ParseError),
      Audit.AuditRunNotFoundError,
      Workflow.InvalidEvent,
      Workflow.InvalidState,
      Workflow.InvalidTemplate,
    ),
    payload: { id: Audit.AuditRunId },
  }),
  Rpc.make("AuditRunFail", {
    success: Audit.AuditRun,
    error: Schema.Union(
      DatabaseError,
      Schema.instanceOf(ParseError),
      Audit.AuditRunNotFoundError,
      Workflow.InvalidEvent,
      Workflow.InvalidState,
      Workflow.InvalidTemplate,
    ),
    payload: { id: Audit.AuditRunId },
  }),
).middleware(AuthMiddleware) {}
