import { Control, Framework } from "@chronops/domain";
import { Rpc, RpcGroup } from "@effect/rpc";
import { SqlError } from "@effect/sql";
import { Schema } from "effect";
import { ParseError } from "effect/ParseResult";
import { AuthMiddleware } from "../auth/middleware-interface";
import { Pagination } from "../common/repository";

export class ControlContract extends RpcGroup.make(
  Rpc.make("ControlCreate", {
    success: Control.Control,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Framework.FrameworkNotFoundError,
    ),
    payload: Control.CreateControl,
  }),
  Rpc.make("ControlById", {
    success: Schema.Option(Control.Control),
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
    payload: { id: Control.ControlId },
  }),
  Rpc.make("ControlList", {
    success: Schema.Array(Control.Control),
    payload: Pagination,
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
  }),
  Rpc.make("ControlUpdate", {
    success: Control.Control,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Control.ControlNotFoundError,
      Framework.FrameworkNotFoundError,
    ),
    payload: {
      id: Control.ControlId,
      data: Control.UpdateControl,
    },
  }),
  Rpc.make("ControlRemove", {
    success: Schema.Void,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Control.ControlNotFoundError,
    ),
    payload: { id: Control.ControlId },
  }),
  Rpc.make("ControlByFramework", {
    success: Schema.Array(Control.Control),
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
    payload: { frameworkId: Framework.FrameworkId },
  }),
  Rpc.make("ControlCount", {
    success: Schema.Number,
    payload: Schema.Void,
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
  }),
).middleware(AuthMiddleware) {}
