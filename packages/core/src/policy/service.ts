import { Actor, Control, EntityType, Event, Policy } from "@chronops/domain";
import { and, count, eq, isNull } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { Pagination } from "../common/repository";
import { EventService } from "../common/service/event-service";
import { Database } from "../db";

export class PolicyService extends Effect.Service<PolicyService>()("PolicyService", {
  effect: Effect.gen(function* () {
    const { use, tables } = yield* Database;
    const eventService = yield* EventService;

    const getById = Effect.fn(function* (id: Schema.Schema.Type<typeof Policy.PolicyId>) {
      const actor = yield* Actor.Actor;
      const model = yield* use((db) =>
        db.query.policy.findFirst({
          where: and(
            eq(tables.policy.id, id),
            eq(tables.policy.orgId, actor.orgId),
            isNull(tables.policy.deletedAt),
          ),
        }),
      );

      if (!model) {
        throw yield* Policy.PolicyNotFoundError.fromId(id);
      }

      return Policy.Policy.make(model);
    });

    const list = Effect.fn(function* (
      pagination: Schema.Schema.Type<typeof Pagination>,
      filter?: {
        status?: Schema.Schema.Type<typeof Policy.PolicyStatus>;
        ownerId?: Schema.Schema.Type<typeof Actor.MemberId>;
        controlId?: Schema.Schema.Type<typeof Control.ControlId>;
      },
    ) {
      const actor = yield* Actor.Actor;
      const filters = [eq(tables.policy.orgId, actor.orgId), isNull(tables.policy.deletedAt)];

      if (filter?.status) {
        filters.push(eq(tables.policy.status, filter.status));
      }

      if (filter?.ownerId) {
        filters.push(eq(tables.policy.ownerId, filter.ownerId));
      }

      if (filter?.controlId) {
        filters.push(eq(tables.policy.controlId, filter.controlId));
      }

      const models = yield* use((db) =>
        db.query.policy.findMany({
          where: and(...filters),
          offset: (pagination.page - 1) * pagination.size,
          limit: pagination.size,
        }),
      );

      const [total] = yield* use((db) =>
        db
          .select({ count: count() })
          .from(tables.policy)
          .where(and(...filters)),
      );

      return {
        data: models.map((model) => Policy.Policy.make(model)),
        total: total?.count ?? 0,
        page: pagination.page,
        size: pagination.size,
      };
    });

    const insert = Effect.fn(function* (input: Policy.CreatePolicy) {
      const model = yield* Policy.make(input);
      yield* use((db) => db.insert(tables.policy).values(model));
      const event = yield* Event.make({
        name: Policy.Event.created,
        entityId: model.id,
        entityType: EntityType.Policy,
        revisionId: model.revisionId,
        revisionIdBefore: null,
      });
      yield* eventService.append(event);
      return model;
    });

    const update = Effect.fn(function* ({
      id,
      data,
    }: {
      id: Schema.Schema.Type<typeof Policy.PolicyId>;
      data: Schema.Schema.Type<typeof Policy.UpdatePolicy>;
    }) {
      const model = yield* getById(id);
      const updatedModel = yield* Policy.update(model, data);
      yield* use((db) => db.insert(tables.policy).values(updatedModel));
      const event = yield* Event.make({
        name: Policy.Event.updated,
        entityId: updatedModel.id,
        entityType: EntityType.Policy,
        revisionId: updatedModel.revisionId,
        revisionIdBefore: model.revisionId,
      });
      yield* eventService.append(event);
      return updatedModel;
    });

    const remove = Effect.fn(function* (id: Schema.Schema.Type<typeof Policy.PolicyId>) {
      const model = yield* getById(id);
      const removedModel = yield* Policy.remove(model);
      yield* use((db) => db.insert(tables.policy).values(removedModel));
      const event = yield* Event.make({
        name: Policy.Event.deleted,
        entityId: removedModel.id,
        entityType: EntityType.Policy,
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
