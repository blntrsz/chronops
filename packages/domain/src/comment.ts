import { Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Base from "./base";
import * as Control from "./control";
import * as Document from "./document";
import * as Framework from "./framework";

export const CommentId = Schema.String.pipe(Schema.brand("CommentId"));
export type CommentId = typeof CommentId.Type;

/**
 * Generate a new CommentId
 * @since 1.0.0
 */
export const commentId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return CommentId.make(`cmt_${createId()}`);
});

export const CommentEntityId = Schema.Union(
  Framework.FrameworkId,
  Control.ControlId,
  Document.DocumentId,
);
export type CommentEntityId = typeof CommentEntityId.Type;

export class Comment extends Base.Base.extend<Comment>("Comment")({
  id: CommentId,
  entityId: CommentEntityId,
  body: Schema.String,
}) {}

export const CreateComment = Comment.pipe(Schema.pick("entityId", "body"));
export type CreateComment = typeof CreateComment.Type;

/**
 * Create a new Comment
 * @since 1.0.0
 */
export const make = Effect.fn(function* (input: CreateComment) {
  const base = yield* Base.makeBase();
  return Comment.make({
    id: yield* commentId(),
    ...input,
    ...base,
  });
});
