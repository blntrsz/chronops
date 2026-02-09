import { Actor, Event } from "@chronops/domain";
import { and, count, eq } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { Pagination } from "../repository";
import { Database } from "../../db";

export class EventService extends Effect.Service<EventService>()("EventService", {
  effect: Effect.gen(function* () {
    const { use, tables } = yield* Database;

    const append = Effect.fn(function* (input: Event.DomainEvent) {
      yield* use((db) => db.insert(tables.event).values(input));
      return Event.DomainEvent.make(input);
    });

    const list = Effect.fn(function* (
      pagination: Schema.Schema.Type<typeof Pagination>,
      filter?: {
        name?: string;
        actorId?: Schema.Schema.Type<typeof Actor.MemberId>;
        entityType?: string;
        entityId?: string;
      },
    ) {
      const actor = yield* Actor.Actor;
      const filters = [eq(tables.event.orgId, actor.orgId)];

      if (filter?.name) {
        filters.push(eq(tables.event.name, filter.name));
      }

      if (filter?.actorId) {
        filters.push(eq(tables.event.actorId, filter.actorId));
      }

      if (filter?.entityType) {
        filters.push(eq(tables.event.entityType, filter.entityType));
      }

      if (filter?.entityId) {
        filters.push(eq(tables.event.entityId, filter.entityId));
      }

      const models = yield* use((db) =>
        db.query.event.findMany({
          where: and(...filters),
          offset: (pagination.page - 1) * pagination.size,
          limit: pagination.size,
          orderBy: (event, { desc }) => [desc(event.typeStamp)],
        }),
      );

      const [total] = yield* use((db) =>
        db
          .select({ count: count() })
          .from(tables.event)
          .where(and(...filters)),
      );

      return {
        data: models.map((model) => Event.DomainEvent.make(model)),
        total: total?.count ?? 0,
        page: pagination.page,
        size: pagination.size,
      };
    });

    return {
      append,
      list,
    };
  }),
}) {}
