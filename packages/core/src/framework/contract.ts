import { Framework } from "@chronops/domain";
import { Rpc, RpcGroup } from "@effect/rpc";
import { SqlError } from "@effect/sql";
import { Schema } from "effect";
import { ParseError } from "effect/ParseResult";
import { AuthMiddleware } from "../auth/middleware-interface";
import { Pagination } from "../common/repository";

export class FrameworkContract extends RpcGroup.make(
  Rpc.make("FrameworkCreate", {
    success: Framework.Framework,
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
    payload: Framework.CreateFramework,
  }),
  Rpc.make("FrameworkById", {
    success: Schema.Option(Framework.Framework),
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
    payload: { id: Framework.FrameworkId },
  }),
  Rpc.make("FrameworkList", {
    success: Schema.Array(Framework.Framework),
    payload: Pagination,
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
  }),
  Rpc.make("FrameworkUpdate", {
    success: Framework.Framework,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Framework.FrameworkNotFoundError,
    ),
    payload: {
      id: Framework.FrameworkId,
      data: Framework.UpdateFramework,
    },
  }),
  Rpc.make("FrameworkRemove", {
    success: Schema.Void,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Framework.FrameworkNotFoundError,
    ),
    payload: { id: Framework.FrameworkId },
  }),
  Rpc.make("FrameworkCount", {
    success: Schema.Number,
    payload: Schema.Void,
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
  }),
).middleware(AuthMiddleware) {}
