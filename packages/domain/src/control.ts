import { Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Base from "./base";
import { FrameworkId } from "./framework";

// --- Id ---

export const ControlId = Schema.String.pipe(Schema.brand("ControlId"));
export type ControlId = typeof ControlId.Type;

export const controlId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;

  return ControlId.make(`ctr_${createId()}`);
});

// --- Model ---

export const ControlStatus = Schema.Union(
  Schema.Literal("draft"),
  Schema.Literal("active"),
  Schema.Literal("deprecated"),
);
export type ControlStatus = typeof ControlStatus.Type;

export class Control extends Base.Base.extend<Control>("Control")({
  id: ControlId,
  name: Schema.String,
  description: Schema.optional(Schema.String),
  frameworkId: FrameworkId,
  status: ControlStatus,
  testingFrequency: Schema.optional(Schema.String),
}) {}

// --- Input Schemas ---

export const CreateControl = Control.pipe(
  Schema.pick(
    "name",
    "description",
    "frameworkId",
    "status",
    "testingFrequency",
  ),
);
export type CreateControl = typeof CreateControl.Type;

export const UpdateControl = CreateControl.pipe(Schema.partial);
export type UpdateControl = typeof UpdateControl.Type;

// --- Operations ---

export const make = Effect.fn(function* (input: CreateControl) {
  const base = yield* Base.make();

  return Control.make({
    id: yield* controlId(),
    ...input,
    ...base,
  });
});

export const update = Effect.fn(function* (
  model: Control,
  input: UpdateControl,
) {
  const base = yield* Base.update();

  return Control.make({
    ...model,
    ...input,
    ...base,
  });
});

export const remove = Effect.fn(function* (model: Control) {
  const base = yield* Base.remove();

  return Control.make({
    ...model,
    ...base,
  });
});

// --- Errors ---

export class ControlNotFoundError extends Schema.TaggedError<ControlNotFoundError>(
  "ControlNotFoundError",
)("ControlNotFoundError", {
  message: Schema.String,
}) {
  static fromId(id: ControlId) {
    return new ControlNotFoundError({
      message: `Control with id ${id} not found`,
    });
  }
}
