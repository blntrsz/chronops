import { Effect, Schema } from "effect";
import { Framework } from "@chronops/domain";
import { Actor } from "@chronops/domain/actor";
import { SqlClient, SqlSchema } from "@effect/sql";
import * as CrudService from "../common/crud-service";

const CountResult = Schema.Struct({ count: Schema.Number });

export class FrameworkService extends Effect.Service<FrameworkService>()(
  "FrameworkService",
  {
    effect: Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      const service = yield* CrudService.makeCrudService({
        idSchema: Framework.FrameworkId,
        modelSchema: Framework.Framework,
        tableName: "framework",
        entityType: "framework",
        createInput: Framework.CreateFramework,
        updateInput: Framework.UpdateFramework,
        notFoundError: Framework.FrameworkNotFoundError,
        makeModel: Framework.make,
        updateModel: Framework.update,
        removeModel: Framework.remove,
      });

      const count = Effect.fn(function* () {
        const actor = yield* Actor;
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
        getById: service.getById,
        list: service.list,
        remove: service.remove,
        insert: service.insert,
        update: service.update,
        count,
      };
    }),
  },
) {}
