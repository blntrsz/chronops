import { Actor, Base, Control, EntityType, Event, Framework } from "@chronops/domain";
import { and, count, eq, isNull } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { Pagination } from "../common/repository";
import { EventService } from "../common/service/event-service";
import { Database } from "../db";
import { TicketService } from "../ticket/service";

export class ControlService extends Effect.Service<ControlService>()("ControlService", {
  effect: Effect.gen(function* () {
    const { use, tables } = yield* Database;
    const eventService = yield* EventService;
    const ticketService = yield* TicketService;

    /**
     * Get a control by its ID.
     * @since 1.0.0
     * @category service-method
     */
    const getById = Effect.fn(function* (id: Schema.Schema.Type<typeof Control.ControlId>) {
      const actor = yield* Actor.Actor;
      const model = yield* use((db) =>
        db.query.control.findFirst({
          where: and(
            eq(tables.control.id, id),
            eq(tables.control.orgId, actor.orgId),
            isNull(tables.control.deletedAt),
          ),
        }),
      );

      if (!model) {
        throw yield* Control.ControlNotFoundError.fromId(id);
      }

      return Control.Control.make(model);
    });

    /**
     * List controls with pagination.
     * @since 1.0.0
     * @category service-method
     */
    const list = Effect.fn(function* (
      pagination: Schema.Schema.Type<typeof Pagination>,
      filter?: {
        frameworkId?: Schema.Schema.Type<typeof Framework.FrameworkId>;
      },
    ) {
      const actor = yield* Actor.Actor;
      const filters = [eq(tables.control.orgId, actor.orgId), isNull(tables.control.deletedAt)];

      if (filter?.frameworkId) {
        filters.push(eq(tables.control.frameworkId, filter.frameworkId));
      }

      const models = yield* use((db) =>
        db.query.control.findMany({
          where: and(...filters),
          offset: (pagination.page - 1) * pagination.size,
          limit: pagination.size,
        }),
      );

      const [total] = yield* use((db) =>
        db
          .select({ count: count() })
          .from(tables.control)
          .where(and(...filters)),
      );

      return {
        data: models.map((model) => Control.Control.make(model)),
        total: total?.count ?? 0,
        page: pagination.page,
        size: pagination.size,
      };
    });

    /**
     * Insert a new control.
     * @since 1.0.0
     * @category service-method
     */
    const insert = Effect.fn(function* (input: Control.CreateControl) {
      const actor = yield* Actor.Actor;
      const ticket = yield* ticketService.next(actor.orgId, Base.TicketPrefix.make("CTR"));
      const model = yield* Control.make({ ...input, ticket } as Control.CreateControlInput);
      yield* use((db) => db.insert(tables.control).values(model));
      const event = yield* Event.make({
        name: Control.Event.created,
        entityId: model.id,
        entityType: EntityType.Control,
        revisionId: model.revisionId,
        revisionIdBefore: null,
      });
      yield* eventService.append(event);
      return model;
    });

    /**
     * Update an existing control.
     * @since 1.0.0
     * @category service-method
     */
    const update = Effect.fn(function* ({
      id,
      data,
    }: {
      id: Schema.Schema.Type<typeof Control.ControlId>;
      data: Schema.Schema.Type<typeof Control.UpdateControl>;
    }) {
      const model = yield* getById(id);

      const updatedModel = yield* Control.update(model, data);
      yield* use((db) => db.insert(tables.control).values(updatedModel));
      const event = yield* Event.make({
        name: Control.Event.updated,
        entityId: updatedModel.id,
        entityType: EntityType.Control,
        revisionId: updatedModel.revisionId,
        revisionIdBefore: model.revisionId,
      });
      yield* eventService.append(event);
      return updatedModel;
    });

    /**
     * Remove a control by its ID.
     * @since 1.0.0
     * @category service-method
     */
    const remove = Effect.fn(function* (id: Schema.Schema.Type<typeof Control.ControlId>) {
      const model = yield* getById(id);
      const removedModel = yield* Control.remove(model);
      yield* use((db) => db.insert(tables.control).values(removedModel));
      const event = yield* Event.make({
        name: Control.Event.deleted,
        entityId: removedModel.id,
        entityType: EntityType.Control,
        revisionId: removedModel.revisionId,
        revisionIdBefore: model.revisionId,
      });
      yield* eventService.append(event);
    });

    return {
      getById,
      list,
      insert,
      update,
      remove,
    };
  }),
}) {}
