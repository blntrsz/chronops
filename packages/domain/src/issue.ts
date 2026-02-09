import { Effect } from "effect";
import * as Schema from "effect/Schema";
import * as AssessmentInstance from "./assessment-instance";
import * as Base from "./base";
import * as Control from "./control";
import * as Evidence from "./evidence";
import * as Workflow from "./workflow";

export const IssueId = Schema.String.pipe(Schema.brand("IssueId"));
export type IssueId = typeof IssueId.Type;

export const issueId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return IssueId.make(Base.buildId("iss", createId));
});

export const IssueStatus = Schema.Union(
  Schema.Literal("open"),
  Schema.Literal("in_progress"),
  Schema.Literal("resolved"),
  Schema.Literal("closed"),
);
export type IssueStatus = typeof IssueStatus.Type;

export const IssueSeverity = Schema.Union(
  Schema.Literal("low"),
  Schema.Literal("medium"),
  Schema.Literal("high"),
  Schema.Literal("critical"),
);
export type IssueSeverity = typeof IssueSeverity.Type;

export const IssueType = Schema.Union(Schema.Literal("issue"), Schema.Literal("finding"));
export type IssueType = typeof IssueType.Type;

export class Issue extends Base.Base.extend<Issue>("Issue")({
  id: IssueId,
  title: Schema.String,
  description: Schema.NullOr(Schema.String),
  type: IssueType,
  status: IssueStatus,
  severity: Schema.NullOr(IssueSeverity),
  controlId: Control.ControlId,
  assessmentInstanceId: Schema.NullOr(AssessmentInstance.AssessmentInstanceId),
  evidenceId: Schema.NullOr(Evidence.EvidenceId),
  dueAt: Schema.NullOr(Schema.DateTimeUtc),
  resolvedAt: Schema.NullOr(Schema.DateTimeUtc),
}) {}

export const Event = {
  created: "issue.created",
  updated: "issue.updated",
  deleted: "issue.deleted",
} as const;

export const CreateIssue = Issue.pipe(
  Schema.pick(
    "title",
    "description",
    "type",
    "severity",
    "controlId",
    "assessmentInstanceId",
    "evidenceId",
    "dueAt",
    "resolvedAt",
  ),
);
export type CreateIssue = typeof CreateIssue.Type;

export const UpdateIssue = Issue.pipe(
  Schema.pick(
    "title",
    "description",
    "type",
    "status",
    "severity",
    "controlId",
    "assessmentInstanceId",
    "evidenceId",
    "dueAt",
    "resolvedAt",
  ),
  Schema.partial,
);
export type UpdateIssue = typeof UpdateIssue.Type;

export const IssueTemplate = Workflow.WorkflowTemplate.make({
  initial: "open",
  transitions: {
    open: { start: "in_progress", resolve: "resolved", close: "closed" },
    in_progress: { resolve: "resolved", close: "closed" },
    resolved: { reopen: "open", close: "closed" },
    closed: { reopen: "open" },
  },
});

export type IssueEvent = Workflow.EventOf<typeof IssueTemplate>;

export const make = Effect.fn(function* (input: CreateIssue) {
  const base = yield* Base.makeBase();

  return Issue.make({
    id: yield* issueId(),
    status: "open",
    ...input,
    ...base,
  });
});

export const update = Effect.fn(function* (model: Issue, input: UpdateIssue) {
  const base = yield* Base.updateBase();

  return Issue.make({
    ...model,
    ...input,
    ...base,
  });
});

export const remove = Effect.fn(function* (model: Issue) {
  const base = yield* Base.removeBase();

  return Issue.make({
    ...model,
    ...base,
  });
});

export class IssueNotFoundError extends Base.NotFoundError {
  static override fromId(id: IssueId) {
    return new IssueNotFoundError({
      message: `Issue with id ${id} not found.`,
      entityType: "Issue",
      entityId: id,
    });
  }
}
