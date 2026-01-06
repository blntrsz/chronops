import { Rpc, RpcGroup } from "@effect/rpc";
import { Control, Framework } from "@chronops/domain";
import { Schema } from "effect";
import { SqlError } from "@effect/sql";
import { ParseError } from "effect/ParseResult";
import { Pagination } from "../common/repository";
import { AuthMiddleware } from "../auth/middleware";

export class ControlContract extends RpcGroup.make(
  Rpc.make("ControlCreate", {
    success: Control.Control,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
    ),
    payload: Control.CreateControl,
  }),
  Rpc.make("ControlById", {
    success: Schema.Option(Control.Control),
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
    ),
    payload: Control.ControlId,
  }),
  Rpc.make("ControlList", {
    success: Schema.Array(Control.Control),
    payload: Pagination,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
    ),
  }),
  Rpc.make("ControlUpdate", {
    success: Control.Control,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Control.ControlNotFoundError,
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
    payload: Control.ControlId,
  }),
  Rpc.make("ControlByFramework", {
    success: Schema.Array(Control.Control),
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
    ),
    payload: Framework.FrameworkId,
  }),
).middleware(AuthMiddleware) {}
