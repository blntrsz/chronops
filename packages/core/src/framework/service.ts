import { Actor, Framework } from "@chronops/domain";
import { SqlClient, SqlSchema } from "@effect/sql";
import { Effect, Option, Schema } from "effect";
import * as Repository from "../common/repository";

const CountResult = Schema.Struct({ count: Schema.NumberFromString });

export class FrameworkService extends Effect.Service<FrameworkService>()("FrameworkService", {
  effect: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const repository = yield* Repository.make({
      id: Framework.FrameworkId,
      model: Framework.Framework,
      tableName: "framework",
    });

    const insert = Effect.fn(function* (
      input: Schema.Schema.Type<typeof Framework.CreateFramework>,
    ) {
      const model = yield* Framework.make(input);
      yield* repository.save(model);
      return model;
    });

    const update = Effect.fn(function* ({
      id,
      data,
    }: {
      id: Schema.Schema.Type<typeof Framework.FrameworkId>;
      data: Schema.Schema.Type<typeof Framework.UpdateFramework>;
    }) {
      const model = yield* repository.getById(id);
      if (Option.isNone(model)) {
        return yield* Effect.fail(Framework.FrameworkNotFoundError.fromId(id));
      }

      const updatedModel = yield* Framework.update(model.value, data);
      yield* repository.save(updatedModel);
      return updatedModel;
    });

    const remove = Effect.fn(function* (id: Schema.Schema.Type<typeof Framework.FrameworkId>) {
      const model = yield* repository.getById(id);
      if (Option.isNone(model)) {
        return yield* Effect.fail(Framework.FrameworkNotFoundError.fromId(id));
      }

      const removedModel = yield* Framework.remove(model.value);
      yield* repository.save(removedModel);
    });

    const count = Effect.fn(function* () {
      const actor = yield* Actor.Actor;
      const result = yield* SqlSchema.findAll({
        Request: Schema.Void,
        Result: CountResult,
        execute() {
          return sql`SELECT COUNT(*) as count FROM ${sql("framework")} WHERE ${sql.and([
            sql`org_id = ${actor.orgId}`,
            sql`deleted_at IS NULL`,
          ])}`;
        },
      })(undefined);
      return result[0]?.count ?? 0;
    });

    return {
      getById: repository.getById,
      list: repository.list,
      remove,
      insert,
      update,
      count,
    };
  }),
}) {}
