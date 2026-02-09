import { DateTime, Effect } from "effect";
import * as Schema from "effect/Schema";
import * as AssessmentTemplate from "./assessment-template";
import * as Base from "./base";
import * as Workflow from "./workflow";

export const AuditId = Schema.String.pipe(Schema.brand("AuditId"));
export type AuditId = typeof AuditId.Type;

export const AuditStatus = Schema.Union(
  Schema.Literal("draft"),
  Schema.Literal("active"),
  Schema.Literal("archived"),
);
export type AuditStatus = typeof AuditStatus.Type;

export const AuditTemplate = Workflow.WorkflowTemplate.make({
  initial: "draft",
  transitions: {
    draft: { activate: "active", archive: "archived" },
    active: { archive: "archived" },
    archived: {},
  },
});

export const Event = {
  created: "audit.created",
  updated: "audit.updated",
  deleted: "audit.deleted",
  runCreated: "audit-run.created",
  runUpdated: "audit-run.updated",
} as const;

export type AuditEvent = Workflow.EventOf<typeof AuditTemplate>;

export const auditId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return AuditId.make(Base.buildId("aud", createId));
});

export class Audit extends Base.Base.extend<Audit>("Audit")({
  id: AuditId,
  name: Schema.String,
  description: Schema.NullOr(Schema.String),
  scope: Schema.NullOr(Schema.String),
  assessmentMethodId: AssessmentTemplate.AssessmentTemplateId,
  status: AuditStatus,
}) {}

export const CreateAudit = Audit.pipe(
  Schema.pick("name", "description", "scope", "assessmentMethodId"),
);
export type CreateAudit = typeof CreateAudit.Type;

export const UpdateAudit = Audit.pipe(
  Schema.pick("name", "description", "scope", "assessmentMethodId", "status"),
  Schema.partial,
);
export type UpdateAudit = typeof UpdateAudit.Type;

export const make = Effect.fn(function* (input: CreateAudit) {
  const base = yield* Base.makeBase();

  return Audit.make({
    id: yield* auditId(),
    status: "draft",
    ...input,
    ...base,
  });
});

export const update = Effect.fn(function* (model: Audit, input: UpdateAudit) {
  const base = yield* Base.updateBase();

  return Audit.make({
    ...model,
    ...input,
    ...base,
  });
});

export const remove = Effect.fn(function* (model: Audit) {
  const base = yield* Base.removeBase();

  return Audit.make({
    ...model,
    ...base,
  });
});

export class AuditNotFoundError extends Base.NotFoundError {
  static override fromId(id: AuditId) {
    return new AuditNotFoundError({
      message: `Audit with id ${id} not found.`,
      entityType: "Audit",
      entityId: id,
    });
  }
}

export const AuditRunId = Schema.String.pipe(Schema.brand("AuditRunId"));
export type AuditRunId = typeof AuditRunId.Type;

export const AuditRunStatus = Schema.Union(
  Schema.Literal("planned"),
  Schema.Literal("in_progress"),
  Schema.Literal("completed"),
  Schema.Literal("failed"),
);
export type AuditRunStatus = typeof AuditRunStatus.Type;

export const AuditRunTemplate = Workflow.WorkflowTemplate.make({
  initial: "planned",
  transitions: {
    planned: { start: "in_progress" },
    in_progress: { complete: "completed", fail: "failed" },
    completed: {},
    failed: {},
  },
});

export type AuditRunEvent = Workflow.EventOf<typeof AuditRunTemplate>;

export const auditRunId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return AuditRunId.make(Base.buildId("adr", createId));
});

export class AuditRun extends Base.Base.extend<AuditRun>("AuditRun")({
  id: AuditRunId,
  auditId: AuditId,
  assessmentMethodId: AssessmentTemplate.AssessmentTemplateId,
  status: AuditRunStatus,
  startedAt: Schema.NullOr(Schema.DateTimeUtc),
  finishedAt: Schema.NullOr(Schema.DateTimeUtc),
}) {}

export const CreateAuditRun = AuditRun.pipe(Schema.pick("auditId", "assessmentMethodId"));
export type CreateAuditRun = typeof CreateAuditRun.Type;

export const makeRun = Effect.fn(function* (input: CreateAuditRun) {
  const base = yield* Base.makeBase();

  return AuditRun.make({
    id: yield* auditRunId(),
    status: "planned",
    startedAt: null,
    finishedAt: null,
    ...input,
    ...base,
  });
});

export const startRun = Effect.fn(function* (model: AuditRun) {
  const base = yield* Base.updateBase();
  const now = yield* DateTime.now;
  const workflow = yield* Workflow.make(
    AuditRunTemplate,
    model.status as Workflow.StateOf<typeof AuditRunTemplate>,
  );
  const next = yield* Workflow.transition(workflow, "start");

  return AuditRun.make({
    ...model,
    status: next.state as AuditRunStatus,
    startedAt: now,
    ...base,
  });
});

export const markRunCompleted = Effect.fn(function* (model: AuditRun) {
  const base = yield* Base.updateBase();
  const now = yield* DateTime.now;
  const workflow = yield* Workflow.make(
    AuditRunTemplate,
    model.status as Workflow.StateOf<typeof AuditRunTemplate>,
  );
  const next = yield* Workflow.transition(workflow, "complete");

  return AuditRun.make({
    ...model,
    status: next.state as AuditRunStatus,
    finishedAt: now,
    ...base,
  });
});

export const markRunFailed = Effect.fn(function* (model: AuditRun) {
  const base = yield* Base.updateBase();
  const now = yield* DateTime.now;
  const workflow = yield* Workflow.make(
    AuditRunTemplate,
    model.status as Workflow.StateOf<typeof AuditRunTemplate>,
  );
  const next = yield* Workflow.transition(workflow, "fail");

  return AuditRun.make({
    ...model,
    status: next.state as AuditRunStatus,
    finishedAt: now,
    ...base,
  });
});

export class AuditRunNotFoundError extends Base.NotFoundError {
  static override fromId(id: AuditRunId) {
    return new AuditRunNotFoundError({
      message: `AuditRun with id ${id} not found.`,
      entityType: "AuditRun",
      entityId: id,
    });
  }
}
