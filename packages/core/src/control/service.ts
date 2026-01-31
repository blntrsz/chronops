import { Actor, Control, Framework } from "@chronops/domain";
import { and, count, eq, isNull } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { Pagination } from "../common/repository";
import { Database } from "../db";

export class ControlService extends Effect.Service<ControlService>()("ControlService", {
  effect: Effect.gen(function* () {
    const { use, tables } = yield* Database;

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
      const model = yield* Control.make(input);
      yield* use((db) => db.insert(tables.control).values(model));
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
