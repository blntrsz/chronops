import { Effect } from "effect";
import * as Schema from "effect/Schema";
import { ULID } from "./base";
import { FrameworkId } from "./framework";

export const ControlId = Schema.String.pipe(Schema.brand("ControlId"));
export type ControlId = typeof ControlId.Type;

export const ControlStatus = Schema.Union(
  Schema.Literal("draft"),
  Schema.Literal("active"),
  Schema.Literal("deprecated"),
);
export type ControlStatus = typeof ControlStatus.Type;

export const makeControlId = Effect.fn(function* () {
  const { createId } = yield* ULID;

  return ControlId.make(`ctrl_${createId()}`);
});

export class Control extends Schema.Class<Control>("Control")({
  id: ControlId,
  name: Schema.String,
  description: Schema.optional(Schema.String),
  frameworkId: FrameworkId,
  status: ControlStatus,
  testingFrequency: Schema.optional(Schema.String),
}) {
  update(input: UpdateControl) {
    return new Control({
      ...this,
      ...input,
    });
  }
}

export const CreateControl = Control.pipe(Schema.pick("name", "description", "frameworkId", "status", "testingFrequency"));
export type CreateControl = typeof CreateControl.Type;

export const UpdateControl = CreateControl.pipe(Schema.partial);
export type UpdateControl = typeof UpdateControl.Type;

export const make = Effect.fn(function* (input: CreateControl) {
  return Control.make({
    id: yield* makeControlId(),
    ...input,
  });
});
