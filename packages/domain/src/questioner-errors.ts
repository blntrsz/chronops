import { Schema } from "effect";

export class QuestionerInvalidQuestionError extends Schema.TaggedError<QuestionerInvalidQuestionError>(
  "QuestionerInvalidQuestionError",
)("QuestionerInvalidQuestionError", {
  message: Schema.String,
  questionId: Schema.optional(Schema.String),
}) {}
