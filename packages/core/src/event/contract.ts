import { Actor, Event } from "@chronops/domain";
import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";
import { ParseError } from "effect/ParseResult";
import { AuthMiddleware } from "../auth/middleware-interface";
import { Pagination } from "../common/repository";
import { DatabaseError } from "../db-error";
import { Paginated } from "../common/pagination";

export class EventContract extends RpcGroup.make(
  Rpc.make("EventList", {
    success: Paginated(Event.DomainEvent),
    payload: Pagination.pipe(
      Schema.extend(
        Schema.Struct({
          name: Schema.optional(Schema.String),
          actorId: Schema.optional(Actor.MemberId),
          entityType: Schema.optional(Schema.String),
          entityId: Schema.optional(Schema.String),
        }),
      ),
    ),
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
  }),
).middleware(AuthMiddleware) {}
