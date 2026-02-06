import { AI } from "@chronops/domain";
import { Effect, Schema } from "effect";
import { embed } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export class AIAuthenticationError extends Schema.TaggedError<AIAuthenticationError>(
  "AIAuthenticationError",
)("AIAuthenticationError", { message: Schema.String }) {}

export class AIRateLimitError extends Schema.TaggedError<AIRateLimitError>("AIRateLimitError")(
  "AIRateLimitError",
  { message: Schema.String },
) {}

export class AIConnectionError extends Schema.TaggedError<AIConnectionError>("AIConnectionError")(
  "AIConnectionError",
  { message: Schema.String },
) {}

export class AITimeoutError extends Schema.TaggedError<AITimeoutError>("AITimeoutError")(
  "AITimeoutError",
  { message: Schema.String },
) {}

export class AIBadRequestError extends Schema.TaggedError<AIBadRequestError>("AIBadRequestError")(
  "AIBadRequestError",
  { message: Schema.String },
) {}

export class AIService extends Effect.Service<AIService>()("AIService", {
  effect: Effect.gen(function* () {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return yield* new AIAuthenticationError({
        message: "OPENAI_API_KEY environment variable is not set",
      });
    }

    const openai = createOpenAI({ apiKey });
    const embeddingModel = openai.embedding("text-embedding-3-small");

    const convertToVector = Effect.fn(function* (text: string) {
      const result = yield* Effect.tryPromise({
        try: () =>
          embed({
            model: embeddingModel,
            value: text,
          }),
        catch: (error: unknown) => {
          if (error instanceof Error) {
            const message = error.message.toLowerCase();

            if (
              message.includes("401") ||
              message.includes("unauthorized") ||
              message.includes("authentication")
            ) {
              return new AIAuthenticationError({
                message: error.message || "Invalid OpenAI API key",
              });
            }

            if (
              message.includes("429") ||
              message.includes("rate limit") ||
              message.includes("too many requests")
            ) {
              return new AIRateLimitError({
                message: error.message || "Rate limit exceeded",
              });
            }

            if (message.includes("400") || message.includes("bad request")) {
              return new AIBadRequestError({
                message: error.message || "Invalid request",
              });
            }

            if (message.includes("timeout") || message.includes("etimedout")) {
              return new AITimeoutError({
                message: error.message || "Request to OpenAI API timed out",
              });
            }

            if (
              message.includes("network") ||
              message.includes("connection") ||
              message.includes("enotfound")
            ) {
              return new AIConnectionError({
                message: error.message || "Failed to connect to OpenAI API",
              });
            }

            return new AIConnectionError({
              message: error.message || "Unknown error occurred",
            });
          }

          return new AIConnectionError({
            message: "Unknown error occurred",
          });
        },
      });

      return AI.Vector.make(result.embedding);
    });

    return { convertToVector };
  }),
}) {}
