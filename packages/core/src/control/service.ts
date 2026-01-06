import { SqlClient, SqlSchema } from "@effect/sql";
import { Effect, Option } from "effect";
import * as Repository from "../common/repository";
import { Control, Framework } from "@chronops/domain";
import { Actor } from "@chronops/domain/actor";

export class ControlService extends Effect.Service<ControlService>()(
  "ControlService",
  {
    effect: Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      const actor = yield* Actor;

      const repository = yield* Repository.make({
        id: Control.ControlId,
        model: Control.Control,
        tableName: "control",
      });

      const insert = Effect.fn(function* (input: Control.CreateControl) {
        const model = yield* Control.make(input);
        yield* repository.save(model);

        return model;
      });

      const update = Effect.fn(function* ({
        id,
        data,
      }: {
        id: Control.ControlId;
        data: Control.UpdateControl;
      }) {
        const model = yield* repository.getById(id);
        if (Option.isNone(model)) {
          return yield* Control.ControlNotFoundError.fromId(id);
        }

        const updatedModel = yield* Control.update(model.value, data);

        yield* repository.save(updatedModel);

        return updatedModel;
      });

      const remove = Effect.fn(function* (id: Control.ControlId) {
        const model = yield* repository.getById(id);
        if (Option.isNone(model)) {
          return yield* Control.ControlNotFoundError.fromId(id);
        }

        const deletedModel = yield* Control.remove(model.value);

        yield* repository.save(deletedModel);

        return deletedModel;
      });

      const getByFramework = SqlSchema.findAll({
        Request: Framework.FrameworkId,
        Result: Control.Control,
        execute(frameworkId) {
          return sql`SELECT * FROM ${sql("control")} WHERE ${sql.and([
            sql`framework_id = ${frameworkId}`,
            sql`org_id = ${actor.orgId}`,
            sql`deleted_at IS NULL`,
          ])}`;
        },
      });

      return {
        insert,
        update,
        remove,
        getById: repository.getById,
        list: repository.list,
        getByFramework,
      };
    }),
  },
) {}
