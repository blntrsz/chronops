import { Comment } from "@chronops/domain";
import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";
import { ParseError } from "effect/ParseResult";
import { AuthMiddleware } from "../auth/middleware-interface";
import { Pagination } from "../common/repository";
import { DatabaseError } from "../db-error";
import { Paginated } from "../common/pagination";

export class CommentContract extends RpcGroup.make(
  Rpc.make("CommentCreate", {
    success: Comment.Comment,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
    payload: Comment.CreateComment,
  }),
  Rpc.make("CommentById", {
    success: Comment.Comment,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError), Comment.CommentNotFoundError),
    payload: { id: Comment.CommentId },
  }),
  Rpc.make("CommentList", {
    success: Paginated(Comment.Comment),
    payload: Pagination.pipe(
      Schema.extend(
        Schema.Struct({
          entityId: Schema.optional(Comment.CommentEntityId),
        }),
      ),
    ),
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
  }),
  Rpc.make("CommentUpdate", {
    success: Comment.Comment,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError), Comment.CommentNotFoundError),
    payload: {
      id: Comment.CommentId,
      data: Comment.UpdateComment,
    },
  }),
  Rpc.make("CommentRemove", {
    success: Schema.Void,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError), Comment.CommentNotFoundError),
    payload: { id: Comment.CommentId },
  }),
).middleware(AuthMiddleware) {}
