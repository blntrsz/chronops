import { Tag } from "@chronops/domain";
import { Rpc, RpcGroup } from "@effect/rpc";
import { SqlError } from "@effect/sql";
import { Schema } from "effect";
import { ParseError } from "effect/ParseResult";
import { AuthMiddleware } from "../auth/middleware-interface";
import { Pagination } from "../common/repository";
import { EntityId } from "./service";

export class TagContract extends RpcGroup.make(
  Rpc.make("TagCreate", {
    success: Tag.Tag,
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
    payload: Tag.CreateTag,
  }),
  Rpc.make("TagById", {
    success: Schema.Option(Tag.Tag),
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
    payload: { id: Tag.TagId },
  }),
  Rpc.make("TagList", {
    success: Schema.Array(Tag.Tag),
    payload: Pagination,
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
  }),
  Rpc.make("TagUpdate", {
    success: Tag.Tag,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Tag.TagNotFoundError,
    ),
    payload: {
      id: Tag.TagId,
      data: Tag.UpdateTag,
    },
  }),
  Rpc.make("TagRemove", {
    success: Schema.Void,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Tag.TagNotFoundError,
    ),
    payload: { id: Tag.TagId },
  }),
  Rpc.make("TagListByEntity", {
    success: Schema.Array(Tag.Tag),
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
    payload: { entityId: EntityId },
  }),
  Rpc.make("TagAttach", {
    success: Schema.Void,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Tag.TagNotFoundError,
    ),
    payload: {
      entityId: EntityId,
      tagId: Tag.TagId,
    },
  }),
  Rpc.make("TagDetach", {
    success: Schema.Void,
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
    payload: {
      entityId: EntityId,
      tagId: Tag.TagId,
    },
  }),
).middleware(AuthMiddleware) {}
