import { Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Actor from "./actor";
import * as Base from "./base";
import * as Event from "./event";
import { QuestionerInvalidQuestionError } from "./questioner-errors";

export const QuestionerTemplateId = Schema.String.pipe(Schema.brand("QuestionerTemplateId"));
export type QuestionerTemplateId = typeof QuestionerTemplateId.Type;

export const QuestionerQuestionType = Schema.Union(
  Schema.Literal("text"),
  Schema.Literal("textarea"),
  Schema.Literal("select"),
  Schema.Literal("multiselect"),
  Schema.Literal("number"),
  Schema.Literal("date"),
  Schema.Literal("boolean"),
);
export type QuestionerQuestionType = typeof QuestionerQuestionType.Type;

export const QuestionerQuestion = Schema.mutable(
  Schema.Struct({
    id: Schema.String,
    prompt: Schema.String,
    type: QuestionerQuestionType,
    required: Schema.optional(Schema.Boolean),
    options: Schema.optional(Schema.Array(Schema.String)),
    helpText: Schema.optional(Schema.String),
    placeholder: Schema.optional(Schema.String),
  }),
);
export type QuestionerQuestion = typeof QuestionerQuestion.Type;

export class CreateQuestionerTemplateEvent extends Event.DomainEvent.extend<CreateQuestionerTemplateEvent>(
  "CreateQuestionerTemplateEvent",
)({
  name: Schema.Literal("questioner-template.created"),
  entityType: Schema.Literal("questioner-template"),
}) {}

export class UpdateQuestionerTemplateEvent extends Event.DomainEvent.extend<UpdateQuestionerTemplateEvent>(
  "UpdateQuestionerTemplateEvent",
)({
  name: Schema.Literal("questioner-template.updated"),
  entityType: Schema.Literal("questioner-template"),
}) {}

export class DeleteQuestionerTemplateEvent extends Event.DomainEvent.extend<DeleteQuestionerTemplateEvent>(
  "DeleteQuestionerTemplateEvent",
)({
  name: Schema.Literal("questioner-template.deleted"),
  entityType: Schema.Literal("questioner-template"),
}) {}

export const makeCreateQuestionerTemplateEvent = Effect.fn(function* (
  previous: QuestionerTemplate | null,
  next: QuestionerTemplate,
) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "questioner-template.created",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous?.revisionId ?? null,
    revisionId: next.revisionId,
    entityType: "questioner-template",
    entityId: next.id,
  });

  return CreateQuestionerTemplateEvent.make({
    ...event,
    name: "questioner-template.created",
    entityType: "questioner-template",
  });
});

export const makeUpdateQuestionerTemplateEvent = Effect.fn(function* (
  previous: QuestionerTemplate,
  next: QuestionerTemplate,
) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "questioner-template.updated",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous.revisionId,
    revisionId: next.revisionId,
    entityType: "questioner-template",
    entityId: next.id,
  });

  return UpdateQuestionerTemplateEvent.make({
    ...event,
    name: "questioner-template.updated",
    entityType: "questioner-template",
  });
});

export const makeDeleteQuestionerTemplateEvent = Effect.fn(function* (
  previous: QuestionerTemplate,
  next: QuestionerTemplate,
) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "questioner-template.deleted",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous.revisionId,
    revisionId: next.revisionId,
    entityType: "questioner-template",
    entityId: next.id,
  });

  return DeleteQuestionerTemplateEvent.make({
    ...event,
    name: "questioner-template.deleted",
    entityType: "questioner-template",
  });
});

export const questionerTemplateId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return QuestionerTemplateId.make(Base.buildId("qst", createId));
});

export class QuestionerTemplate extends Base.Base.extend<QuestionerTemplate>("QuestionerTemplate")({
  id: QuestionerTemplateId,
  name: Schema.String,
  description: Schema.NullOr(Schema.String),
  questions: Schema.Array(QuestionerQuestion),
}) {}

export const CreateQuestionerTemplate = Schema.mutable(
  Schema.Struct({
    name: Schema.String,
    description: Schema.NullOr(Schema.String),
    questions: Schema.optional(Schema.Array(QuestionerQuestion)),
  }),
);
export type CreateQuestionerTemplate = typeof CreateQuestionerTemplate.Type;

export const UpdateQuestionerTemplate = Schema.mutable(
  Schema.Struct({
    name: Schema.optional(Schema.String),
    description: Schema.optional(Schema.NullOr(Schema.String)),
    questions: Schema.optional(Schema.Array(QuestionerQuestion)),
  }),
);
export type UpdateQuestionerTemplate = typeof UpdateQuestionerTemplate.Type;

export const make = Effect.fn(function* (input: CreateQuestionerTemplate) {
  const base = yield* Base.makeBase();
  const questions = input.questions ?? [];

  for (const question of questions) {
    if (question.type === "select" || question.type === "multiselect") {
      if (!question.options || question.options.length === 0) {
        throw new QuestionerInvalidQuestionError({
          message: "Options required for select questions",
          questionId: question.id,
        });
      }
    }
  }

  return QuestionerTemplate.make({
    id: yield* questionerTemplateId(),
    name: input.name,
    description: input.description,
    questions,
    ...base,
  });
});

export const update = Effect.fn(function* (
  model: QuestionerTemplate,
  input: UpdateQuestionerTemplate,
) {
  const base = yield* Base.updateBase();
  const questions = input.questions ?? model.questions;

  for (const question of questions) {
    if (question.type === "select" || question.type === "multiselect") {
      if (!question.options || question.options.length === 0) {
        throw new QuestionerInvalidQuestionError({
          message: "Options required for select questions",
          questionId: question.id,
        });
      }
    }
  }

  return QuestionerTemplate.make({
    ...model,
    ...input,
    questions,
    ...base,
  });
});

export const remove = Effect.fn(function* (model: QuestionerTemplate) {
  const base = yield* Base.removeBase();

  return QuestionerTemplate.make({
    ...model,
    ...base,
  });
});

export class QuestionerTemplateNotFoundError extends Base.NotFoundError {
  static override fromId(id: QuestionerTemplateId) {
    return new QuestionerTemplateNotFoundError({
      message: `Questioner template with id ${id} not found.`,
      entityType: "QuestionerTemplate",
      entityId: id,
    });
  }
}
