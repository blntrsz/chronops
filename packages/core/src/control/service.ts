import { Actor, Control } from "@chronops/domain";
import { SqlClient, SqlSchema } from "@effect/sql";
import { Effect, Option, Schema } from "effect";
import * as Repository from "../common/repository";

const CountResult = Schema.Struct({ count: Schema.NumberFromString });

export class ControlService extends Effect.Service<ControlService>()("ControlService", {
  effect: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const repository = yield* Repository.make({
      id: Control.ControlId,
      model: Control.Control,
      tableName: "control",
    });

    const insert = Effect.fn(function* (input: Schema.Schema.Type<typeof Control.CreateControl>) {
      const model = yield* Control.make(input);
      yield* repository.save(model);
      return model;
    });

    const update = Effect.fn(function* ({
      id,
      data,
    }: {
      id: Schema.Schema.Type<typeof Control.ControlId>;
      data: Schema.Schema.Type<typeof Control.UpdateControl>;
    }) {
      const model = yield* repository.getById(id);
      if (Option.isNone(model)) {
        return yield* Effect.fail(Control.ControlNotFoundError.fromId(id));
      }

      const updatedModel = yield* Control.update(model.value, data);
      yield* repository.save(updatedModel);
      return updatedModel;
    });

    const remove = Effect.fn(function* (id: Schema.Schema.Type<typeof Control.ControlId>) {
      const model = yield* repository.getById(id);
      if (Option.isNone(model)) {
        return yield* Effect.fail(Control.ControlNotFoundError.fromId(id));
      }

      const removedModel = yield* Control.remove(model.value);
      yield* repository.save(removedModel);
    });

    const count = Effect.fn(function* () {
      const actor = yield* Actor.Actor;
      const result = yield* SqlSchema.findAll({
        Request: Schema.Void,
        Result: CountResult,
        execute() {
          return sql`SELECT COUNT(*) as count FROM ${sql("control")} WHERE ${sql.and([
            sql`org_id = ${actor.orgId}`,
            sql`deleted_at IS NULL`,
          ])}`;
        },
      })(undefined);
      return result[0]?.count ?? 0;
    });

    const getByFramework = (frameworkId: any) =>
      Effect.gen(function* () {
        const actor = yield* Actor.Actor;
        return yield* sql<Control.Control>`
            SELECT * FROM ${sql("control")} 
            WHERE ${sql.and([
              sql`framework_id = ${frameworkId}`,
              sql`org_id = ${actor.orgId}`,
              sql`deleted_at IS NULL`,
            ])}
          `;
      });

    return {
      insert,
      update,
      remove,
      getById: repository.getById,
      list: repository.list,
      getByFramework,
      count,
    };
  }),
}) {}
