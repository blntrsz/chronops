import { Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Actor from "./actor";
import * as Base from "./base";
import * as Control from "./control";
import * as Event from "./event";
import * as Workflow from "./workflow";

export const AssessmentTemplateId = Schema.String.pipe(Schema.brand("AssessmentTemplateId"));
export type AssessmentTemplateId = typeof AssessmentTemplateId.Type;

export const AssessmentWorkflowStatus = Schema.Union(
  Schema.Literal("draft"),
  Schema.Literal("active"),
  Schema.Literal("archived"),
);
export type AssessmentWorkflowStatus = typeof AssessmentWorkflowStatus.Type;

export const AssessmentTemplateWorkflow = Workflow.WorkflowTemplate.make({
  initial: "draft",
  transitions: {
    draft: { activate: "active", archive: "archived" },
    active: { archive: "archived" },
    archived: {},
  },
});

export type AssessmentTemplateEvent = Workflow.EventOf<typeof AssessmentTemplateWorkflow>;

export class CreateAssessmentTemplateEvent extends Event.DomainEvent.extend<CreateAssessmentTemplateEvent>(
  "CreateAssessmentTemplateEvent",
)({
  name: Schema.Literal("assessment-template.created"),
  entityType: Schema.Literal("assessment-template"),
}) {}

export class UpdateAssessmentTemplateEvent extends Event.DomainEvent.extend<UpdateAssessmentTemplateEvent>(
  "UpdateAssessmentTemplateEvent",
)({
  name: Schema.Literal("assessment-template.updated"),
  entityType: Schema.Literal("assessment-template"),
}) {}

export class DeleteAssessmentTemplateEvent extends Event.DomainEvent.extend<DeleteAssessmentTemplateEvent>(
  "DeleteAssessmentTemplateEvent",
)({
  name: Schema.Literal("assessment-template.deleted"),
  entityType: Schema.Literal("assessment-template"),
}) {}

export const makeCreateAssessmentTemplateEvent = Effect.fn(function* (
  previous: AssessmentTemplate | null,
  next: AssessmentTemplate,
) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "assessment-template.created",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous?.revisionId ?? null,
    revisionId: next.revisionId,
    entityType: "assessment-template",
    entityId: next.id,
  });

  return CreateAssessmentTemplateEvent.make({
    ...event,
    name: "assessment-template.created",
    entityType: "assessment-template",
  });
});

export const makeUpdateAssessmentTemplateEvent = Effect.fn(function* (
  previous: AssessmentTemplate,
  next: AssessmentTemplate,
) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "assessment-template.updated",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous.revisionId,
    revisionId: next.revisionId,
    entityType: "assessment-template",
    entityId: next.id,
  });

  return UpdateAssessmentTemplateEvent.make({
    ...event,
    name: "assessment-template.updated",
    entityType: "assessment-template",
  });
});

export const makeDeleteAssessmentTemplateEvent = Effect.fn(function* (
  previous: AssessmentTemplate,
  next: AssessmentTemplate,
) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "assessment-template.deleted",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous.revisionId,
    revisionId: next.revisionId,
    entityType: "assessment-template",
    entityId: next.id,
  });

  return DeleteAssessmentTemplateEvent.make({
    ...event,
    name: "assessment-template.deleted",
    entityType: "assessment-template",
  });
});

export const assessmentTemplateId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return AssessmentTemplateId.make(Base.buildId("ast", createId));
});

export class AssessmentTemplate extends Base.Base.extend<AssessmentTemplate>("AssessmentTemplate")({
  id: AssessmentTemplateId,
  controlId: Control.ControlId,
  name: Schema.String,
  description: Schema.NullOr(Schema.String),
  status: AssessmentWorkflowStatus,
}) {}

export const CreateAssessmentTemplate = AssessmentTemplate.pipe(
  Schema.pick("controlId", "name", "description"),
);
export type CreateAssessmentTemplate = typeof CreateAssessmentTemplate.Type;

export const UpdateAssessmentTemplate = AssessmentTemplate.pipe(
  Schema.pick("name", "description", "status"),
  Schema.partial,
);
export type UpdateAssessmentTemplate = typeof UpdateAssessmentTemplate.Type;

export const make = Effect.fn(function* (input: CreateAssessmentTemplate) {
  const base = yield* Base.makeBase();

  return AssessmentTemplate.make({
    id: yield* assessmentTemplateId(),
    status: "draft",
    ...input,
    ...base,
  });
});

export const update = Effect.fn(function* (
  model: AssessmentTemplate,
  input: UpdateAssessmentTemplate,
) {
  const base = yield* Base.updateBase();

  return AssessmentTemplate.make({
    ...model,
    ...input,
    ...base,
  });
});

export const remove = Effect.fn(function* (model: AssessmentTemplate) {
  const base = yield* Base.removeBase();

  return AssessmentTemplate.make({
    ...model,
    ...base,
  });
});

export class AssessmentTemplateNotFoundError extends Base.NotFoundError {
  static override fromId(id: AssessmentTemplateId) {
    return new AssessmentTemplateNotFoundError({
      message: `Assessment template with id ${id} not found.`,
      entityType: "AssessmentTemplate",
      entityId: id,
    });
  }
}
