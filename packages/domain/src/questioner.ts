import { DateTime, Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Base from "./base";

export const QuestionerId = Schema.String.pipe(Schema.brand("QuestionerId"));
export type QuestionerId = typeof QuestionerId.Type;

export const questionerId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return QuestionerId.make(`qst_${createId()}`);
});

export const QuestionerResponseId = Schema.String.pipe(
  Schema.brand("QuestionerResponseId"),
);
export type QuestionerResponseId = typeof QuestionerResponseId.Type;

export const questionerResponseId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return QuestionerResponseId.make(`qsr_${createId()}`);
});

export const QuestionType = Schema.Literal(
  "text",
  "number",
  "boolean",
  "select",
  "multi_select",
);
export type QuestionType = typeof QuestionType.Type;

export const Question = Schema.Struct({
  id: Schema.String,
  text: Schema.String,
  type: QuestionType,
  description: Schema.NullOr(Schema.String),
  required: Schema.Boolean,
  options: Schema.NullOr(Schema.Array(Schema.String)),
  evidenceRequired: Schema.Boolean,
  scoringKey: Schema.NullOr(Schema.Struct({
    correctAnswer: Schema.Union(Schema.String, Schema.Number, Schema.Boolean),
    weight: Schema.Number,
  })),
});
export type Question = typeof Question.Type;

export const QuestionerStatus = Schema.Literal("draft", "active", "archived");
export type QuestionerStatus = typeof QuestionerStatus.Type;

export const ScoringConfig = Schema.Struct({
  passingScore: Schema.Number,
  autoScore: Schema.Boolean,
});
export type ScoringConfig = typeof ScoringConfig.Type;

export class Questioner extends Base.Base.extend<Questioner>("Questioner")({
  id: QuestionerId,
  name: Schema.String,
  description: Schema.NullOr(Schema.String),
  questions: Schema.Array(Question),
  scoringConfig: ScoringConfig,
  status: QuestionerStatus,
}) {}

export const CreateQuestioner = Schema.Struct({
  name: Schema.String,
  description: Schema.optional(Schema.NullOr(Schema.String)),
  questions: Schema.Array(Question),
  scoringConfig: Schema.optional(ScoringConfig),
});
export type CreateQuestioner = typeof CreateQuestioner.Type;

export const UpdateQuestioner = Schema.Struct({
  name: Schema.optional(Schema.String),
  description: Schema.optional(Schema.NullOr(Schema.String)),
  questions: Schema.optional(Schema.Array(Question)),
  scoringConfig: Schema.optional(ScoringConfig),
  status: Schema.optional(QuestionerStatus),
});
export type UpdateQuestioner = typeof UpdateQuestioner.Type;

export const make = Effect.fn(function* (input: CreateQuestioner) {
  const base = yield* Base.makeBase();
  return Questioner.make({
    id: yield* questionerId(),
    name: input.name,
    description: input.description ?? null,
    questions: input.questions,
    scoringConfig: input.scoringConfig ?? { passingScore: 70, autoScore: true },
    status: "draft",
    ...base,
  });
});

export const update = Effect.fn(function* (
  questioner: Questioner,
  input: UpdateQuestioner,
) {
  const base = yield* Base.updateBase();
  return Questioner.make({
    ...questioner,
    ...(input.name !== undefined && { name: input.name }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.questions !== undefined && { questions: input.questions }),
    ...(input.scoringConfig !== undefined && { scoringConfig: input.scoringConfig }),
    ...(input.status !== undefined && { status: input.status }),
    ...base,
  });
});

export const remove = Effect.fn(function* (questioner: Questioner) {
  const base = yield* Base.removeBase();
  return Questioner.make({ ...questioner, ...base });
});

export class QuestionerNotFoundError extends Base.NotFoundError {
  static override fromId(id: QuestionerId) {
    return new QuestionerNotFoundError({
      message: `Questioner with id ${id} not found.`,
      entityType: "Questioner",
      entityId: id,
    });
  }
}

export const ResponseStatus = Schema.Literal(
  "draft",
  "submitted",
  "under_review",
  "completed",
);
export type ResponseStatus = typeof ResponseStatus.Type;

export const ResponseAnswer = Schema.Struct({
  questionId: Schema.String,
  value: Schema.Union(Schema.String, Schema.Number, Schema.Boolean, Schema.Array(Schema.String)),
  evidenceIds: Schema.Array(Schema.String),
});
export type ResponseAnswer = typeof ResponseAnswer.Type;

export class QuestionerResponse extends Base.Base.extend<QuestionerResponse>("QuestionerResponse")({
  id: QuestionerResponseId,
  questionerId: QuestionerId,
  entityId: Schema.String,
  entityType: Schema.String,
  answers: Schema.Array(ResponseAnswer),
  score: Schema.NullOr(Schema.Number),
  submittedAt: Schema.NullOr(Schema.DateTimeUtc),
  submittedBy: Schema.NullOr(Schema.String),
  reviewedAt: Schema.NullOr(Schema.DateTimeUtc),
  reviewedBy: Schema.NullOr(Schema.String),
  reviewNotes: Schema.NullOr(Schema.String),
  status: ResponseStatus,
}) {}

export const CreateQuestionerResponse = Schema.Struct({
  questionerId: QuestionerId,
  entityId: Schema.String,
  entityType: Schema.String,
  answers: Schema.Array(ResponseAnswer),
});
export type CreateQuestionerResponse = typeof CreateQuestionerResponse.Type;

export const UpdateQuestionerResponse = Schema.Struct({
  answers: Schema.optional(Schema.Array(ResponseAnswer)),
  score: Schema.optional(Schema.NullOr(Schema.Number)),
  reviewNotes: Schema.optional(Schema.NullOr(Schema.String)),
  status: Schema.optional(ResponseStatus),
});
export type UpdateQuestionerResponse = typeof UpdateQuestionerResponse.Type;

export const makeResponse = Effect.fn(function* (input: CreateQuestionerResponse) {
  const base = yield* Base.makeBase();
  return QuestionerResponse.make({
    id: yield* questionerResponseId(),
    questionerId: input.questionerId,
    entityId: input.entityId,
    entityType: input.entityType,
    answers: input.answers,
    score: null,
    submittedAt: null,
    submittedBy: null,
    reviewedAt: null,
    reviewedBy: null,
    reviewNotes: null,
    status: "draft",
    ...base,
  });
});

export const updateResponse = Effect.fn(function* (
  response: QuestionerResponse,
  input: UpdateQuestionerResponse,
) {
  const base = yield* Base.updateBase();
  return QuestionerResponse.make({
    ...response,
    ...(input.answers !== undefined && { answers: input.answers }),
    ...(input.score !== undefined && { score: input.score }),
    ...(input.reviewNotes !== undefined && { reviewNotes: input.reviewNotes }),
    ...(input.status !== undefined && { status: input.status }),
    ...base,
  });
});

export const submitResponse = Effect.fn(function* (
  response: QuestionerResponse,
  actorId: string,
) {
  const base = yield* Base.updateBase();
  const now = yield* DateTime.now;
  return QuestionerResponse.make({
    ...response,
    status: "submitted",
    submittedAt: now,
    submittedBy: actorId,
    ...base,
  });
});

export const reviewResponse = Effect.fn(function* (
  response: QuestionerResponse,
  input: {
    score: number;
    reviewNotes?: string | null;
    reviewerId: string;
  },
) {
  const base = yield* Base.updateBase();
  const now = yield* DateTime.now;
  return QuestionerResponse.make({
    ...response,
    status: "completed",
    score: input.score,
    reviewNotes: input.reviewNotes ?? null,
    reviewedAt: now,
    reviewedBy: input.reviewerId,
    ...base,
  });
});

export class QuestionerResponseNotFoundError extends Base.NotFoundError {
  static override fromId(id: QuestionerResponseId) {
    return new QuestionerResponseNotFoundError({
      message: `QuestionerResponse with id ${id} not found.`,
      entityType: "QuestionerResponse",
      entityId: id,
    });
  }
}
