import { SqlClient, SqlSchema } from "@effect/sql";
import { Effect, Schema } from "effect";
import { Control } from "@chronops/domain";
import { Actor } from "@chronops/domain/actor";
import * as CrudService from "../common/crud-service";

const CountResult = Schema.Struct({ count: Schema.Number });

export class ControlService extends Effect.Service<ControlService>()(
  "ControlService",
  {
    effect: Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      const service = yield* CrudService.makeCrudService({
        idSchema: Control.ControlId,
        modelSchema: Control.Control,
        tableName: "control",
        entityType: "control",
        createInput: Control.CreateControl,
        updateInput: Control.UpdateControl,
        notFoundError: Control.ControlNotFoundError,
        makeModel: Control.make,
        updateModel: Control.update,
        removeModel: Control.remove,
      });

      const count = Effect.fn(function* () {
        const actor = yield* Actor;
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
          const actor = yield* Actor;
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
        insert: service.insert,
        update: service.update,
        remove: service.remove,
        getById: service.getById,
        list: service.list,
        getByFramework,
        count,
      };
    }),
  },
) {}
