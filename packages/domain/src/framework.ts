import { Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Base from "./base";

// --- Id ---

export const FrameworkId = Schema.String.pipe(Schema.brand("FrameworkId"));
export type FrameworkId = typeof FrameworkId.Type;

export const frameworkId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;

  return FrameworkId.make(`fwk_${createId()}`);
});

// --- Model ---

export class Framework extends Base.Base.extend<Framework>("Framework")({
  id: FrameworkId,
  name: Schema.String,
  description: Schema.optional(Schema.String),
  version: Schema.optional(Schema.String),
  sourceUrl: Schema.optional(Schema.String),
}) {}

// --- Input Schemas ---

export const CreateFramework = Framework.pipe(
  Schema.pick("name", "description", "version", "sourceUrl"),
);
export type CreateFramework = typeof CreateFramework.Type;

export const UpdateFramework = CreateFramework.pipe(Schema.partial);
export type UpdateFramework = typeof UpdateFramework.Type;

// --- Operations ---

export const make = Effect.fn(function* (input: CreateFramework) {
  const base = yield* Base.make();

  return Framework.make({
    id: yield* frameworkId(),
    ...input,
    ...base,
  });
});

export const update = Effect.fn(function* (
  model: Framework,
  input: UpdateFramework,
) {
  const base = yield* Base.update();

  return Framework.make({
    ...model,
    ...input,
    ...base,
  });
});

export const remove = Effect.fn(function* (model: Framework) {
  const base = yield* Base.remove();

  return Framework.make({
    ...model,
    ...base,
  });
});

// --- Errors ---

export class FrameworkNotFoundError extends Schema.TaggedError<FrameworkNotFoundError>(
  "FrameworkNotFoundError",
)("FrameworkNotFoundError", {
  message: Schema.String,
}) {
  static fromId(id: FrameworkId) {
    return new FrameworkNotFoundError({
      message: `Framework with id ${id} not found.`,
    });
  }
}
