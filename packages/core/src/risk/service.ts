import { Actor, Control, Risk } from "@chronops/domain";
import { and, count, eq, isNull } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { Pagination } from "../common/repository";
import { Database } from "../db";

export class RiskService extends Effect.Service<RiskService>()("RiskService", {
  effect: Effect.gen(function* () {
    const { use, tables } = yield* Database;

    const getById = Effect.fn(function* (id: Schema.Schema.Type<typeof Risk.RiskId>) {
      const actor = yield* Actor.Actor;
      const model = yield* use((db) =>
        db.query.risk.findFirst({
          where: and(
            eq(tables.risk.id, id),
            eq(tables.risk.orgId, actor.orgId),
            isNull(tables.risk.deletedAt),
          ),
        }),
      );

      if (!model) {
        throw yield* Risk.RiskNotFoundError.fromId(id);
      }

      return Risk.Risk.make(model);
    });

    const list = Effect.fn(function* (
      pagination: Schema.Schema.Type<typeof Pagination>,
      filter?: {
        controlId?: Schema.Schema.Type<typeof Control.ControlId>;
        status?: Schema.Schema.Type<typeof Risk.RiskStatus>;
        likelihood?: Schema.Schema.Type<typeof Risk.RiskLikelihood>;
        impact?: Schema.Schema.Type<typeof Risk.RiskImpact>;
        treatment?: Schema.Schema.Type<typeof Risk.RiskTreatment>;
      },
    ) {
      const actor = yield* Actor.Actor;
      const filters = [eq(tables.risk.orgId, actor.orgId), isNull(tables.risk.deletedAt)];

      if (filter?.controlId) {
        filters.push(eq(tables.risk.controlId, filter.controlId));
      }

      if (filter?.status) {
        filters.push(eq(tables.risk.status, filter.status));
      }

      if (filter?.likelihood) {
        filters.push(eq(tables.risk.likelihood, filter.likelihood));
      }

      if (filter?.impact) {
        filters.push(eq(tables.risk.impact, filter.impact));
      }

      if (filter?.treatment) {
        filters.push(eq(tables.risk.treatment, filter.treatment));
      }

      const models = yield* use((db) =>
        db.query.risk.findMany({
          where: and(...filters),
          offset: (pagination.page - 1) * pagination.size,
          limit: pagination.size,
        }),
      );

      const [total] = yield* use((db) =>
        db
          .select({ count: count() })
          .from(tables.risk)
          .where(and(...filters)),
      );

      return {
        data: models.map((model) => Risk.Risk.make(model)),
        total: total?.count ?? 0,
        page: pagination.page,
        size: pagination.size,
      };
    });

    const insert = Effect.fn(function* (input: Risk.CreateRisk) {
      const model = yield* Risk.make(input);
      yield* use((db) => db.insert(tables.risk).values(model));
      return model;
    });

    const update = Effect.fn(function* ({
      id,
      data,
    }: {
      id: Schema.Schema.Type<typeof Risk.RiskId>;
      data: Schema.Schema.Type<typeof Risk.UpdateRisk>;
    }) {
      const model = yield* getById(id);
      const updatedModel = yield* Risk.update(model, data);
      yield* use((db) => db.insert(tables.risk).values(updatedModel));
      return updatedModel;
    });

    const remove = Effect.fn(function* (id: Schema.Schema.Type<typeof Risk.RiskId>) {
      const model = yield* getById(id);
      const removedModel = yield* Risk.remove(model);
      yield* use((db) => db.insert(tables.risk).values(removedModel));
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
