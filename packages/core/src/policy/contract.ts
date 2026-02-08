import { Actor, Control, Policy } from "@chronops/domain";
import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";
import { ParseError } from "effect/ParseResult";
import { AuthMiddleware } from "../auth/middleware-interface";
import { Pagination } from "../common/repository";
import { DatabaseError } from "../db-error";
import { Paginated } from "../common/pagination";

export class PolicyContract extends RpcGroup.make(
  Rpc.make("PolicyCreate", {
    success: Policy.Policy,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
    payload: Policy.CreatePolicy,
  }),
  Rpc.make("PolicyById", {
    success: Policy.Policy,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError), Policy.PolicyNotFoundError),
    payload: { id: Policy.PolicyId },
  }),
  Rpc.make("PolicyList", {
    success: Paginated(Policy.Policy),
    payload: Pagination.pipe(
      Schema.extend(
        Schema.Struct({
          status: Schema.optional(Policy.PolicyStatus),
          ownerId: Schema.optional(Actor.MemberId),
          controlId: Schema.optional(Control.ControlId),
        }),
      ),
    ),
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
  }),
  Rpc.make("PolicyUpdate", {
    success: Policy.Policy,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError), Policy.PolicyNotFoundError),
    payload: {
      id: Policy.PolicyId,
      data: Policy.UpdatePolicy,
    },
  }),
  Rpc.make("PolicyRemove", {
    success: Schema.Void,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError), Policy.PolicyNotFoundError),
    payload: { id: Policy.PolicyId },
  }),
).middleware(AuthMiddleware) {}
