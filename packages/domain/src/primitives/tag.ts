import { Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Base from "./base";

export const TagId = Schema.String.pipe(Schema.brand("TagId"));
export type TagId = typeof TagId.Type;

export const tagId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return TagId.make(`tag_${createId()}`);
});

export const TagName = Schema.String.pipe(
  Schema.minLength(1),
  Schema.maxLength(50),
);
export type TagName = typeof TagName.Type;

export const TagColor = Schema.String.pipe(
  Schema.pattern(/^#[0-9A-Fa-f]{6}$/),
);
export type TagColor = typeof TagColor.Type;

export class Tag extends Base.Base.extend<Tag>("Tag")({
  id: TagId,
  name: TagName,
  color: Schema.NullOr(TagColor),
}) {}

export const CreateTag = Schema.Struct({
  name: TagName,
  color: Schema.optional(Schema.NullOr(TagColor)),
});
export type CreateTag = typeof CreateTag.Type;

export const UpdateTag = Schema.Struct({
  name: Schema.optional(TagName),
  color: Schema.optional(Schema.NullOr(TagColor)),
});
export type UpdateTag = typeof UpdateTag.Type;

export const make = Effect.fn(function* (input: CreateTag) {
  const base = yield* Base.makeBase();
  return Tag.make({
    id: yield* tagId(),
    name: input.name,
    color: input.color ?? null,
    ...base,
  });
});

export const update = Effect.fn(function* (tag: Tag, input: UpdateTag) {
  const base = yield* Base.updateBase();
  return Tag.make({
    ...tag,
    ...(input.name !== undefined && { name: input.name }),
    ...(input.color !== undefined && { color: input.color }),
    ...base,
  });
});

export const remove = Effect.fn(function* (tag: Tag) {
  const base = yield* Base.removeBase();
  return Tag.make({ ...tag, ...base });
});

export class TagNotFoundError extends Base.NotFoundError {
  static override fromId(id: TagId) {
    return new TagNotFoundError({
      message: `Tag with id ${id} not found.`,
      entityType: "Tag",
      entityId: id,
    });
  }
}
