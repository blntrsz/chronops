import { Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Base from "./base";
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

export const Event = {
  created: "questioner-template.created",
  updated: "questioner-template.updated",
  deleted: "questioner-template.deleted",
} as const;

export const questionerTemplateId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return QuestionerTemplateId.make(Base.buildId("qst", createId));
});

export class QuestionerTemplate extends Base.Base.extend<QuestionerTemplate>("QuestionerTemplate")({
  id: QuestionerTemplateId,
  ticket: Base.Ticket,
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

export type CreateQuestionerTemplateInput = CreateQuestionerTemplate & { ticket: Base.Ticket };

export const UpdateQuestionerTemplate = Schema.mutable(
  Schema.Struct({
    name: Schema.optional(Schema.String),
    description: Schema.optional(Schema.NullOr(Schema.String)),
    questions: Schema.optional(Schema.Array(QuestionerQuestion)),
  }),
);
export type UpdateQuestionerTemplate = typeof UpdateQuestionerTemplate.Type;

export const make = Effect.fn(function* (input: CreateQuestionerTemplateInput) {
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
    ticket: input.ticket,
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
    ticket: model.ticket,
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
