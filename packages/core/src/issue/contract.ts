import { AssessmentInstance, Control, Evidence, Issue } from "@chronops/domain";
import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";
import { ParseError } from "effect/ParseResult";
import { AuthMiddleware } from "../auth/middleware-interface";
import { Pagination } from "../common/repository";
import { DatabaseError } from "../db-error";
import { Paginated } from "../common/pagination";

export class IssueContract extends RpcGroup.make(
  Rpc.make("IssueCreate", {
    success: Issue.Issue,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
    payload: Issue.CreateIssue,
  }),
  Rpc.make("IssueById", {
    success: Issue.Issue,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError), Issue.IssueNotFoundError),
    payload: { id: Issue.IssueId },
  }),
  Rpc.make("IssueList", {
    success: Paginated(Issue.Issue),
    payload: Pagination.pipe(
      Schema.extend(
        Schema.Struct({
          controlId: Schema.optional(Control.ControlId),
          assessmentInstanceId: Schema.optional(AssessmentInstance.AssessmentInstanceId),
          evidenceId: Schema.optional(Evidence.EvidenceId),
          status: Schema.optional(Issue.IssueStatus),
          type: Schema.optional(Issue.IssueType),
          severity: Schema.optional(Issue.IssueSeverity),
        }),
      ),
    ),
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
  }),
  Rpc.make("IssueUpdate", {
    success: Issue.Issue,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError), Issue.IssueNotFoundError),
    payload: {
      id: Issue.IssueId,
      data: Issue.UpdateIssue,
    },
  }),
  Rpc.make("IssueRemove", {
    success: Schema.Void,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError), Issue.IssueNotFoundError),
    payload: { id: Issue.IssueId },
  }),
).middleware(AuthMiddleware) {}
