import { DateTime, Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Actor from "./actor";
import * as Base from "./base";
import { ControlId } from "./control";
import { FrameworkId } from "./framework";

export const QuestionerId = Schema.String.pipe(Schema.brand("QuestionerId"));
export type QuestionerId = typeof QuestionerId.Type;

/**
 * Generate a new QuestionerId
 * @since 1.0.0
 */
export const questionerId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;

  return QuestionerId.make(`qst_${createId()}`);
});

/**
 * Questionnaire statuses
 * @since 1.0.0
 */
export const QuestionnaireStatus = Schema.Union(
  Schema.Literal("draft"),
  Schema.Literal("in_progress"),
  Schema.Literal("submitted"),
  Schema.Literal("reviewed"),
  Schema.Literal("archived"),
);
export type QuestionnaireStatus = typeof QuestionnaireStatus.Type;

/**
 * Questionnaire types
 * @since 1.0.0
 */
export const QuestionnaireType = Schema.Union(
  Schema.Literal("control_test"),
  Schema.Literal("risk_assessment"),
  Schema.Literal("compliance_check"),
  Schema.Literal("audit_response"),
);
export type QuestionnaireType = typeof QuestionnaireType.Type;

/**
 * Question types
 * @since 1.0.0
 */
export const QuestionType = Schema.Union(
  Schema.Literal("text"),
  Schema.Literal("multiple_choice"),
  Schema.Literal("boolean"),
  Schema.Literal("scale"),
);
export type QuestionType = typeof QuestionType.Type;

/**
 * Question schema
 * @since 1.0.0
 * @category models
 */
export class Question extends Schema.Class<Question>("Question")({
  id: Schema.String,
  text: Schema.String,
  type: QuestionType,
  required: Schema.Boolean,
  options: Schema.NullOr(Schema.Array(Schema.String)),
}) {}

/**
 * Answer schema
 * @since 1.0.0
 * @category models
 */
export class Answer extends Schema.Class<Answer>("Answer")({
  questionId: Schema.String,
  value: Schema.String,
  answeredAt: Schema.DateTimeUtc,
  answeredBy: Actor.MemberId,
}) {}

/**
 * Questionnaire model
 * @since 1.0.0
 * @category models
 */
export class Questionnaire extends Base.Base.extend<Questionnaire>("Questionnaire")({
  id: QuestionerId,
  name: Schema.String,
  description: Schema.NullOr(Schema.String),
  type: QuestionnaireType,
  status: QuestionnaireStatus,
  frameworkId: Schema.NullOr(FrameworkId),
  controlId: Schema.NullOr(ControlId),
  questions: Schema.Array(Question),
  answers: Schema.Array(Answer),
  dueDate: Schema.NullOr(Schema.DateTimeUtc),
  completedAt: Schema.NullOr(Schema.DateTimeUtc),
}) {}

export const CreateQuestionnaire = Questionnaire.pipe(
  Schema.pick("name", "description", "type", "frameworkId", "controlId", "questions", "dueDate"),
);
export type CreateQuestionnaire = typeof CreateQuestionnaire.Type;

export const UpdateQuestionnaire = CreateQuestionnaire.pipe(Schema.partial);
export type UpdateQuestionnaire = typeof UpdateQuestionnaire.Type;

/**
 * Create a new Questionnaire
 * @since 1.0.0
 */
export const make = Effect.fn(function* (input: CreateQuestionnaire) {
  const base = yield* Base.makeBase();

  return Questionnaire.make({
    id: yield* questionerId(),
    status: "draft",
    answers: [],
    completedAt: null,
    ...input,
    ...base,
  });
});

/**
 * Update an existing Questionnaire
 * @since 1.0.0
 */
export const update = Effect.fn(function* (model: Questionnaire, input: UpdateQuestionnaire) {
  const base = yield* Base.updateBase();

  return Questionnaire.make({
    ...model,
    ...input,
    ...base,
  });
});

/**
 * Submit a Questionnaire
 * @since 1.0.0
 */
export const submit = Effect.fn(function* (model: Questionnaire) {
  const base = yield* Base.updateBase();
  const now = yield* DateTime.now;

  return Questionnaire.make({
    ...model,
    status: "submitted",
    completedAt: now,
    ...base,
  });
});

/**
 * Review a Questionnaire
 * @since 1.0.0
 */
export const review = Effect.fn(function* (model: Questionnaire) {
  const base = yield* Base.updateBase();

  return Questionnaire.make({
    ...model,
    status: "reviewed",
    ...base,
  });
});

/**
 * Remove an existing Questionnaire
 * @since 1.0.0
 */
export const remove = Effect.fn(function* (model: Questionnaire) {
  const base = yield* Base.removeBase();

  return Questionnaire.make({
    ...model,
    ...base,
  });
});

/**
 * Questionnaire not found error
 * @since 1.0.0
 * @category errors
 */
export class QuestionnaireNotFoundError extends Base.NotFoundError {
  static override fromId(id: QuestionerId) {
    return new QuestionnaireNotFoundError({
      message: `Questionnaire with id ${id} not found.`,
      entityType: "Questionnaire",
      entityId: id,
    });
  }
}
