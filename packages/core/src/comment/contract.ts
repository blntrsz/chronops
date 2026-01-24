import { Comment } from "@chronops/domain";
import { Rpc, RpcGroup } from "@effect/rpc";
import { SqlError } from "@effect/sql";
import { Schema } from "effect";
import { ParseError } from "effect/ParseResult";
import { AuthMiddleware } from "../auth/middleware-interface";

export class CommentContract extends RpcGroup.make(
  Rpc.make("CommentCreate", {
    success: Comment.Comment,
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
    payload: Comment.CreateComment,
  }),
  Rpc.make("CommentListByTarget", {
    success: Schema.Array(Comment.Comment),
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
    payload: {
      entityId: Comment.CommentEntityId,
    },
  }),
).middleware(AuthMiddleware) {}
