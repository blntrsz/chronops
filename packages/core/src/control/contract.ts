import { Control, Framework } from "@chronops/domain";
import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";
import { ParseError } from "effect/ParseResult";
import { AuthMiddleware } from "../auth/middleware-interface";
import { Pagination } from "../common/repository";
import { DatabaseError } from "../db";
import { Paginated } from "../common/pagination";

export class ControlContract extends RpcGroup.make(
  Rpc.make("ControlCreate", {
    success: Control.Control,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
    payload: Control.CreateControl,
  }),
  Rpc.make("ControlById", {
    success: Control.Control,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError), Control.ControlNotFoundError),
    payload: { id: Control.ControlId },
  }),
  Rpc.make("ControlList", {
    success: Paginated(Control.Control),
    payload: Pagination.pipe(
      Schema.extend(
        Schema.Struct({
          frameworkId: Schema.optional(Framework.FrameworkId),
        }),
      ),
    ),
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
  }),
  Rpc.make("ControlUpdate", {
    success: Control.Control,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError), Control.ControlNotFoundError),
    payload: {
      id: Control.ControlId,
      data: Control.UpdateControl,
    },
  }),
  Rpc.make("ControlRemove", {
    success: Schema.Void,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError), Control.ControlNotFoundError),
    payload: { id: Control.ControlId },
  }),
).middleware(AuthMiddleware) {}
