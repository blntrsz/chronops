import { Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Actor from "./actor";
import * as Base from "./base";
import * as Control from "./control";
import * as Event from "./event";
import * as Workflow from "./workflow";
import { AssessmentTemplateId } from "./assessment-template";

export const AssessmentInstanceId = Schema.String.pipe(Schema.brand("AssessmentInstanceId"));
export type AssessmentInstanceId = typeof AssessmentInstanceId.Type;

export const AssessmentInstanceStatus = Schema.Union(
  Schema.Literal("planned"),
  Schema.Literal("in_progress"),
  Schema.Literal("completed"),
  Schema.Literal("failed"),
);
export type AssessmentInstanceStatus = typeof AssessmentInstanceStatus.Type;

export const AssessmentInstanceWorkflowStatus = Schema.Union(
  Schema.Literal("draft"),
  Schema.Literal("active"),
  Schema.Literal("archived"),
);
export type AssessmentInstanceWorkflowStatus = typeof AssessmentInstanceWorkflowStatus.Type;

export const AssessmentInstanceWorkflow = Workflow.WorkflowTemplate.make({
  initial: "draft",
  transitions: {
    draft: { activate: "active", archive: "archived" },
    active: { archive: "archived" },
    archived: {},
  },
});

export type AssessmentInstanceEvent = Workflow.EventOf<typeof AssessmentInstanceWorkflow>;

export class CreateAssessmentInstanceEvent extends Event.DomainEvent.extend<CreateAssessmentInstanceEvent>(
  "CreateAssessmentInstanceEvent",
)({
  name: Schema.Literal("assessment-instance.created"),
  entityType: Schema.Literal("assessment-instance"),
}) {}

export class UpdateAssessmentInstanceEvent extends Event.DomainEvent.extend<UpdateAssessmentInstanceEvent>(
  "UpdateAssessmentInstanceEvent",
)({
  name: Schema.Literal("assessment-instance.updated"),
  entityType: Schema.Literal("assessment-instance"),
}) {}

export class DeleteAssessmentInstanceEvent extends Event.DomainEvent.extend<DeleteAssessmentInstanceEvent>(
  "DeleteAssessmentInstanceEvent",
)({
  name: Schema.Literal("assessment-instance.deleted"),
  entityType: Schema.Literal("assessment-instance"),
}) {}

export const makeCreateAssessmentInstanceEvent = Effect.fn(function* (
  previous: AssessmentInstance | null,
  next: AssessmentInstance,
) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "assessment-instance.created",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous?.revisionId ?? null,
    revisionId: next.revisionId,
    entityType: "assessment-instance",
    entityId: next.id,
  });

  return CreateAssessmentInstanceEvent.make({
    ...event,
    name: "assessment-instance.created",
    entityType: "assessment-instance",
  });
});

export const makeUpdateAssessmentInstanceEvent = Effect.fn(function* (
  previous: AssessmentInstance,
  next: AssessmentInstance,
) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "assessment-instance.updated",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous.revisionId,
    revisionId: next.revisionId,
    entityType: "assessment-instance",
    entityId: next.id,
  });

  return UpdateAssessmentInstanceEvent.make({
    ...event,
    name: "assessment-instance.updated",
    entityType: "assessment-instance",
  });
});

export const makeDeleteAssessmentInstanceEvent = Effect.fn(function* (
  previous: AssessmentInstance,
  next: AssessmentInstance,
) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "assessment-instance.deleted",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous.revisionId,
    revisionId: next.revisionId,
    entityType: "assessment-instance",
    entityId: next.id,
  });

  return DeleteAssessmentInstanceEvent.make({
    ...event,
    name: "assessment-instance.deleted",
    entityType: "assessment-instance",
  });
});

export const assessmentInstanceId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return AssessmentInstanceId.make(Base.buildId("asi", createId));
});

export class AssessmentInstance extends Base.Base.extend<AssessmentInstance>("AssessmentInstance")({
  id: AssessmentInstanceId,
  templateId: AssessmentTemplateId,
  controlId: Control.ControlId,
  name: Schema.String,
  status: AssessmentInstanceStatus,
  workflowStatus: AssessmentInstanceWorkflowStatus,
  dueDate: Schema.NullOr(Schema.DateTimeUtc),
}) {}

export const CreateAssessmentInstance = AssessmentInstance.pipe(
  Schema.pick("templateId", "controlId", "name", "dueDate"),
);
export type CreateAssessmentInstance = typeof CreateAssessmentInstance.Type;

export const UpdateAssessmentInstance = AssessmentInstance.pipe(
  Schema.pick("name", "status", "workflowStatus", "dueDate"),
  Schema.partial,
);
export type UpdateAssessmentInstance = typeof UpdateAssessmentInstance.Type;

export const make = Effect.fn(function* (input: CreateAssessmentInstance) {
  const base = yield* Base.makeBase();

  return AssessmentInstance.make({
    id: yield* assessmentInstanceId(),
    status: "planned",
    workflowStatus: "draft",
    ...input,
    ...base,
  });
});

export const update = Effect.fn(function* (
  model: AssessmentInstance,
  input: UpdateAssessmentInstance,
) {
  const base = yield* Base.updateBase();

  return AssessmentInstance.make({
    ...model,
    ...input,
    ...base,
  });
});

export const remove = Effect.fn(function* (model: AssessmentInstance) {
  const base = yield* Base.removeBase();

  return AssessmentInstance.make({
    ...model,
    ...base,
  });
});

export class AssessmentInstanceNotFoundError extends Base.NotFoundError {
  static override fromId(id: AssessmentInstanceId) {
    return new AssessmentInstanceNotFoundError({
      message: `Assessment instance with id ${id} not found.`,
      entityType: "AssessmentInstance",
      entityId: id,
    });
  }
}
