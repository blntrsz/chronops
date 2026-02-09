import { Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Actor from "./actor";
import * as Base from "./base";
import * as Control from "./control";
import * as Framework from "./framework";
import * as Issue from "./issue";
import * as Policy from "./policy";
import * as Risk from "./risk";
import * as Event from "./event";

export const CommentId = Schema.String.pipe(Schema.brand("CommentId"));
export type CommentId = typeof CommentId.Type;

/**
 * Generate a new CommentId
 * @since 1.0.0
 */
export const commentId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return CommentId.make(Base.buildId("cmt", createId));
});

export const CommentEntityId = Schema.Union(
  Framework.FrameworkId,
  Control.ControlId,
  Issue.IssueId,
  Policy.PolicyId,
  Risk.RiskId,
);
export type CommentEntityId = typeof CommentEntityId.Type;

/**
 * Comment model
 * @since 1.0.0
 * @category models
 */
export class Comment extends Base.Base.extend<Comment>("Comment")({
  id: CommentId,
  entityId: CommentEntityId,
  body: Schema.String,
}) {}

export const CreateComment = Comment.pipe(Schema.pick("entityId", "body"));
export type CreateComment = typeof CreateComment.Type;

export const UpdateComment = Comment.pipe(Schema.pick("body"), Schema.partial);
export type UpdateComment = typeof UpdateComment.Type;

export class CreateCommentEvent extends Event.DomainEvent.extend<CreateCommentEvent>(
  "CreateCommentEvent",
)({
  name: Schema.Literal("comment.created"),
  entityType: Schema.Literal("comment"),
}) {}

export class UpdateCommentEvent extends Event.DomainEvent.extend<UpdateCommentEvent>(
  "UpdateCommentEvent",
)({
  name: Schema.Literal("comment.updated"),
  entityType: Schema.Literal("comment"),
}) {}

export class DeleteCommentEvent extends Event.DomainEvent.extend<DeleteCommentEvent>(
  "DeleteCommentEvent",
)({
  name: Schema.Literal("comment.deleted"),
  entityType: Schema.Literal("comment"),
}) {}

export const makeCreateCommentEvent = Effect.fn(function* (
  previous: Comment | null,
  next: Comment,
) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "comment.created",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous?.revisionId ?? null,
    revisionId: next.revisionId,
    entityType: "comment",
    entityId: next.id,
  });

  return CreateCommentEvent.make({
    ...event,
    name: "comment.created",
    entityType: "comment",
  });
});

export const makeUpdateCommentEvent = Effect.fn(function* (previous: Comment, next: Comment) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "comment.updated",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous.revisionId,
    revisionId: next.revisionId,
    entityType: "comment",
    entityId: next.id,
  });

  return UpdateCommentEvent.make({
    ...event,
    name: "comment.updated",
    entityType: "comment",
  });
});

export const makeDeleteCommentEvent = Effect.fn(function* (previous: Comment, next: Comment) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "comment.deleted",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous.revisionId,
    revisionId: next.revisionId,
    entityType: "comment",
    entityId: next.id,
  });

  return DeleteCommentEvent.make({
    ...event,
    name: "comment.deleted",
    entityType: "comment",
  });
});

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

/**
 * Update an existing Comment
 * @since 1.0.0
 */
export const update = Effect.fn(function* (model: Comment, input: UpdateComment) {
  const base = yield* Base.updateBase();

  return Comment.make({
    ...model,
    ...input,
    ...base,
  });
});

/**
 * Remove an existing Comment
 * @since 1.0.0
 */
export const remove = Effect.fn(function* (model: Comment) {
  const base = yield* Base.removeBase();

  return Comment.make({
    ...model,
    ...base,
  });
});

/**
 * Comment not found error
 * @since 1.0.0
 * @category errors
 */
export class CommentNotFoundError extends Base.NotFoundError {
  static override fromId(id: CommentId) {
    return new CommentNotFoundError({
      message: `Comment with id ${id} not found.`,
      entityType: "Comment",
      entityId: id,
    });
  }
}
