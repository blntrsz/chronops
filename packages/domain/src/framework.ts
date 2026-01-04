import { Effect } from "effect";
import * as Schema from "effect/Schema";
import { ULID } from "./base";

export const FrameworkId = Schema.String.pipe(Schema.brand("FrameworkId"));
export type FrameworkId = typeof FrameworkId.Type;

export const makeFrameworkId = Effect.fn(function* () {
  const { createId } = yield* ULID;

  return FrameworkId.make(`fwk_${createId()}`);
});

export class Framework extends Schema.Class<Framework>("Framework")({
  id: FrameworkId,
  name: Schema.String,
}) {
  update(input: UpdateFramework) {
    return new Framework({
      ...this,
      ...input,
    });
  }
}

export const CreateFramework = Framework.pipe(Schema.pick("name"));
export type CreateFramework = typeof CreateFramework.Type;

export const UpdateFramework = CreateFramework.pipe(Schema.partial);
export type UpdateFramework = typeof UpdateFramework.Type;

export const make = Effect.fn(function* (input: CreateFramework) {
  return Framework.make({
    id: yield* makeFrameworkId(),
    ...input,
  });
});
