import { Effect } from "effect";
import { Framework, Workflow } from "@chronops/domain";
import { Actor } from "@chronops/domain/actor";
import { SqlClient } from "@effect/sql";
import * as CrudService from "../common/crud-service";
import { Pagination } from "../common/repository";

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
        const result = yield* sql`SELECT COUNT(*) as count FROM ${sql("framework")} WHERE ${sql.and([
          sql`org_id = ${actor.orgId}`,
          sql`deleted_at IS NULL`,
        ])}`;
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
