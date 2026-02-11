import { DateTime, Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Actor from "./actor";
import * as Base from "./base";
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

export const Event = {
  created: "questioner-instance.created",
  updated: "questioner-instance.updated",
  deleted: "questioner-instance.deleted",
  submitted: "questioner-instance.submitted",
} as const;

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

export const questionerInstanceId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return QuestionerInstanceId.make(Base.buildId("qsi", createId));
});

export class QuestionerInstance extends Base.Base.extend<QuestionerInstance>("QuestionerInstance")({
  id: QuestionerInstanceId,
  ticket: Base.Ticket,
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

export type CreateQuestionerInstanceInput = CreateQuestionerInstance & { ticket: Base.Ticket };

export const UpdateQuestionerInstance = Schema.mutable(
  Schema.Struct({
    name: Schema.optional(Schema.String),
    workflowStatus: Schema.optional(QuestionerWorkflowStatus),
    responses: Schema.optional(Schema.Array(QuestionerResponse)),
  }),
);
export type UpdateQuestionerInstance = typeof UpdateQuestionerInstance.Type;

export const make = Effect.fn(function* (input: CreateQuestionerInstanceInput) {
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
      ticket: model.ticket,
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
    ticket: model.ticket,
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
    ticket: model.ticket,
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
