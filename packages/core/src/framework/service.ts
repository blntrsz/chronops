import { Actor, Framework } from "@chronops/domain";
import { and, count, eq, isNull } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { Pagination } from "../common/repository";
import { Database } from "../db";

export class FrameworkService extends Effect.Service<FrameworkService>()("FrameworkService", {
  effect: Effect.gen(function* () {
    const { use, tables } = yield* Database;

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

      return Framework.Framework.make(model);
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
        data: models.map((model) => Framework.Framework.make(model)),
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
      const model = yield* Framework.make(input);
      yield* use((db) => db.insert(tables.framework).values(model));
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
