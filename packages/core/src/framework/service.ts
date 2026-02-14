import { Actor, Base, EntityType, Event, Framework } from "@chronops/domain";
import { ULID } from "@chronops/domain/src/base";
import { and, count, eq, isNull } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { Pagination } from "../common/repository";
import { EventService } from "../common/service/event-service";
import { Database } from "../db";
import { TicketService } from "../ticket/service";

export class FrameworkService extends Effect.Service<FrameworkService>()("FrameworkService", {
  dependencies: [ULID.Default, Database.Default, EventService.Default, TicketService.Default],
  effect: Effect.gen(function* () {
    const { use, tables } = yield* Database;
    const eventService = yield* EventService;
    const ticketService = yield* TicketService;

    const normalizeVersion = (version: unknown): Framework.SemVer | null => {
      if (typeof version !== "string") {
        return null;
      }
      const trimmed = version.trim();
      if (!trimmed) {
        return null;
      }
      const candidate = /^\d+$/.test(trimmed)
        ? `${trimmed}.0.0`
        : /^\d+\.\d+$/.test(trimmed)
          ? `${trimmed}.0`
          : trimmed;
      const parsed = Schema.decodeUnknownEither(Framework.SemVer)(candidate);
      if (parsed._tag === "Left") {
        return null;
      }
      return parsed.right;
    };

    /**
     * Get a framework by its ID.
     * @since 1.0.0
     * @category service-method
     */
    const getById = Effect.fn(function* (id: Schema.Schema.Type<typeof Framework.FrameworkId>) {
      const actor = yield* Actor.Actor;
      const model = yield* use((db) =>
        db.query.framework.findFirst({
          where: and(
            eq(tables.framework.id, id),
            eq(tables.framework.orgId, actor.orgId),
            isNull(tables.framework.deletedAt),
          ),
        }),
      );
      if (!model) {
        throw yield* Framework.FrameworkNotFoundError.fromId(id);
      }

      return Framework.Framework.make({
        ...model,
        version: normalizeVersion(model.version),
      });
    });

    /**
     * List frameworks with pagination.
     * @since 1.0.0
     * @category service-method
     */
    const list = Effect.fn(function* (pagination: Schema.Schema.Type<typeof Pagination>) {
      const actor = yield* Actor.Actor;
      const models = yield* use((db) =>
        db.query.framework.findMany({
          where: and(eq(tables.framework.orgId, actor.orgId), isNull(tables.framework.deletedAt)),
          offset: (pagination.page - 1) * pagination.size,
          limit: pagination.size,
        }),
      );

      const [total] = yield* use((db) =>
        db
          .select({ count: count() })
          .from(tables.framework)
          .where(and(eq(tables.framework.orgId, actor.orgId), isNull(tables.framework.deletedAt))),
      );

      return {
        data: models.map((model) =>
          Framework.Framework.make({
            ...model,
            version: normalizeVersion(model.version),
          }),
        ),
        total: total?.count ?? 0,
        page: pagination.page,
        size: pagination.size,
      };
    });

    /**
     * Insert a new framework.
     * @since 1.0.0
     * @category service-method
     */
    const insert = Effect.fn(function* (
      input: Schema.Schema.Type<typeof Framework.CreateFramework>,
    ) {
      const actor = yield* Actor.Actor;
      const ticket = yield* ticketService.next(actor.orgId, Base.TicketPrefix.make("FWK"));
      const model = yield* Framework.make({ ...input, ticket } as Framework.CreateFrameworkInput);
      yield* use((db) => db.insert(tables.framework).values(model));
      const event = yield* Event.make({
        name: Framework.Event.created,
        entityId: model.id,
        entityType: EntityType.Framework,
        revisionId: model.revisionId,
        revisionIdBefore: null,
      });
      yield* eventService.append(event);
      return model;
    });

    /**
     * Update an existing framework.
     * @since 1.0.0
     * @category service-method
     */
    const update = Effect.fn(function* ({
      id,
      data,
    }: {
      id: Schema.Schema.Type<typeof Framework.FrameworkId>;
      data: Schema.Schema.Type<typeof Framework.UpdateFramework>;
    }) {
      const model = yield* getById(id);

      const updatedModel = yield* Framework.update(model, data);
      yield* use((db) => db.insert(tables.framework).values(updatedModel));
      const event = yield* Event.make({
        name: Framework.Event.updated,
        entityId: updatedModel.id,
        entityType: EntityType.Framework,
        revisionId: updatedModel.revisionId,
        revisionIdBefore: model.revisionId,
      });
      yield* eventService.append(event);
      return updatedModel;
    });

    /**
     * Remove a framework by its ID.
     * @since 1.0.0
     * @category service-method
     */
    const remove = Effect.fn(function* (id: Schema.Schema.Type<typeof Framework.FrameworkId>) {
      const model = yield* getById(id);

      const removedModel = yield* Framework.remove(model);
      yield* use((db) => db.insert(tables.framework).values(removedModel));
      const event = yield* Event.make({
        name: Framework.Event.deleted,
        entityId: removedModel.id,
        entityType: EntityType.Framework,
        revisionId: removedModel.revisionId,
        revisionIdBefore: model.revisionId,
      });
      yield* eventService.append(event);
    });

    return {
      getById,
      list,
      remove,
      insert,
      update,
    };
  }),
}) {}
