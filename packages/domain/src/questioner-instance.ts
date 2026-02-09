import { DateTime, Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Actor from "./actor";
import * as Base from "./base";
import * as Event from "./event";
import * as Workflow from "./workflow";
import { QuestionerTemplateId, QuestionerQuestionType } from "./questioner-template";

export const QuestionerInstanceId = Schema.String.pipe(Schema.brand("QuestionerInstanceId"));
export type QuestionerInstanceId = typeof QuestionerInstanceId.Type;

export const QuestionerWorkflowStatus = Schema.Union(
  Schema.Literal("draft"),
  Schema.Literal("active"),
  Schema.Literal("submitted"),
);
export type QuestionerWorkflowStatus = typeof QuestionerWorkflowStatus.Type;

export const QuestionerWorkflow = Workflow.WorkflowTemplate.make({
  initial: "draft",
  transitions: {
    draft: { activate: "active" },
    active: { submit: "submitted" },
    submitted: {},
  },
});

export type QuestionerInstanceEvent = Workflow.EventOf<typeof QuestionerWorkflow>;

export const QuestionerResponseValue = Schema.Union(
  Schema.String,
  Schema.Number,
  Schema.Boolean,
  Schema.Array(Schema.String),
  Schema.Null,
);
export type QuestionerResponseValue = typeof QuestionerResponseValue.Type;

export const QuestionerResponse = Schema.mutable(
  Schema.Struct({
    questionId: Schema.String,
    type: QuestionerQuestionType,
    value: QuestionerResponseValue,
  }),
);
export type QuestionerResponse = typeof QuestionerResponse.Type;

export class CreateQuestionerInstanceEvent extends Event.DomainEvent.extend<CreateQuestionerInstanceEvent>(
  "CreateQuestionerInstanceEvent",
)({
  name: Schema.Literal("questioner-instance.created"),
  entityType: Schema.Literal("questioner-instance"),
}) {}

export class UpdateQuestionerInstanceEvent extends Event.DomainEvent.extend<UpdateQuestionerInstanceEvent>(
  "UpdateQuestionerInstanceEvent",
)({
  name: Schema.Literal("questioner-instance.updated"),
  entityType: Schema.Literal("questioner-instance"),
}) {}

export class DeleteQuestionerInstanceEvent extends Event.DomainEvent.extend<DeleteQuestionerInstanceEvent>(
  "DeleteQuestionerInstanceEvent",
)({
  name: Schema.Literal("questioner-instance.deleted"),
  entityType: Schema.Literal("questioner-instance"),
}) {}

export class SubmitQuestionerInstanceEvent extends Event.DomainEvent.extend<SubmitQuestionerInstanceEvent>(
  "SubmitQuestionerInstanceEvent",
)({
  name: Schema.Literal("questioner-instance.submitted"),
  entityType: Schema.Literal("questioner-instance"),
}) {}

export const makeCreateQuestionerInstanceEvent = Effect.fn(function* (
  previous: QuestionerInstance | null,
  next: QuestionerInstance,
) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "questioner-instance.created",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous?.revisionId ?? null,
    revisionId: next.revisionId,
    entityType: "questioner-instance",
    entityId: next.id,
  });

  return CreateQuestionerInstanceEvent.make({
    ...event,
    name: "questioner-instance.created",
    entityType: "questioner-instance",
  });
});

export const makeUpdateQuestionerInstanceEvent = Effect.fn(function* (
  previous: QuestionerInstance,
  next: QuestionerInstance,
) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "questioner-instance.updated",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous.revisionId,
    revisionId: next.revisionId,
    entityType: "questioner-instance",
    entityId: next.id,
  });

  return UpdateQuestionerInstanceEvent.make({
    ...event,
    name: "questioner-instance.updated",
    entityType: "questioner-instance",
  });
});

export const makeDeleteQuestionerInstanceEvent = Effect.fn(function* (
  previous: QuestionerInstance,
  next: QuestionerInstance,
) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "questioner-instance.deleted",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous.revisionId,
    revisionId: next.revisionId,
    entityType: "questioner-instance",
    entityId: next.id,
  });

  return DeleteQuestionerInstanceEvent.make({
    ...event,
    name: "questioner-instance.deleted",
    entityType: "questioner-instance",
  });
});

export const makeSubmitQuestionerInstanceEvent = Effect.fn(function* (
  previous: QuestionerInstance,
  next: QuestionerInstance,
) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "questioner-instance.submitted",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous.revisionId,
    revisionId: next.revisionId,
    entityType: "questioner-instance",
    entityId: next.id,
  });

  return SubmitQuestionerInstanceEvent.make({
    ...event,
    name: "questioner-instance.submitted",
    entityType: "questioner-instance",
  });
});

export const questionerInstanceId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return QuestionerInstanceId.make(Base.buildId("qsi", createId));
});

export class QuestionerInstance extends Base.Base.extend<QuestionerInstance>("QuestionerInstance")({
  id: QuestionerInstanceId,
  templateId: QuestionerTemplateId,
  name: Schema.String,
  workflowStatus: QuestionerWorkflowStatus,
  responses: Schema.Array(QuestionerResponse),
  submittedAt: Schema.NullOr(Schema.DateTimeUtc),
  submittedBy: Schema.NullOr(Actor.MemberId),
}) {}

export const CreateQuestionerInstance = Schema.mutable(
  Schema.Struct({
    templateId: QuestionerTemplateId,
    name: Schema.String,
    responses: Schema.optional(Schema.Array(QuestionerResponse)),
  }),
);
export type CreateQuestionerInstance = typeof CreateQuestionerInstance.Type;

export const UpdateQuestionerInstance = Schema.mutable(
  Schema.Struct({
    name: Schema.optional(Schema.String),
    workflowStatus: Schema.optional(QuestionerWorkflowStatus),
    responses: Schema.optional(Schema.Array(QuestionerResponse)),
  }),
);
export type UpdateQuestionerInstance = typeof UpdateQuestionerInstance.Type;

export const make = Effect.fn(function* (input: CreateQuestionerInstance) {
  const base = yield* Base.makeBase();

  return QuestionerInstance.make({
    id: yield* questionerInstanceId(),
    workflowStatus: "draft",
    responses: input.responses ?? [],
    submittedAt: null,
    submittedBy: null,
    ...input,
    ...base,
  });
});

export const update = Effect.fn(function* (
  model: QuestionerInstance,
  input: UpdateQuestionerInstance,
) {
  const base = yield* Base.updateBase();
  if (model.workflowStatus === "submitted") {
    return QuestionerInstance.make({
      ...model,
      ...base,
    });
  }
  if (input.workflowStatus && input.workflowStatus !== model.workflowStatus) {
    const workflow = yield* Workflow.make(
      QuestionerWorkflow,
      model.workflowStatus as Workflow.StateOf<typeof QuestionerWorkflow>,
    );
    const event = input.workflowStatus === "active" ? "activate" : "submit";
    yield* Workflow.transition(workflow, event);
  }

  return QuestionerInstance.make({
    ...model,
    ...input,
    responses: input.responses ?? model.responses,
    ...base,
  });
});

export const submit = Effect.fn(function* (model: QuestionerInstance) {
  const base = yield* Base.updateBase();
  const now = yield* DateTime.now;
  const actor = yield* Actor.Actor;
  const workflow = yield* Workflow.make(
    QuestionerWorkflow,
    model.workflowStatus as Workflow.StateOf<typeof QuestionerWorkflow>,
  );
  yield* Workflow.transition(workflow, "submit");

  return QuestionerInstance.make({
    ...model,
    workflowStatus: "submitted",
    submittedAt: now,
    submittedBy: actor.memberId,
    ...base,
  });
});

export const remove = Effect.fn(function* (model: QuestionerInstance) {
  const base = yield* Base.removeBase();

  return QuestionerInstance.make({
    ...model,
    ...base,
  });
});

export class QuestionerInstanceNotFoundError extends Base.NotFoundError {
  static override fromId(id: QuestionerInstanceId) {
    return new QuestionerInstanceNotFoundError({
      message: `Questioner instance with id ${id} not found.`,
      entityType: "QuestionerInstance",
      entityId: id,
    });
  }
}
