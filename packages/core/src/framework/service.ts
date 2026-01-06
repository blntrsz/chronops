import { Effect, Option } from "effect";
import * as Repository from "../common/repository";
import { Framework } from "@chronops/domain";

export class FrameworkService extends Effect.Service<FrameworkService>()(
  "FrameworkService",
  {
    effect: Effect.gen(function* () {
      const repository = yield* Repository.make({
        tableName: "framework",
        model: Framework.Framework,
        id: Framework.FrameworkId,
        createSchema: Framework.CreateFramework,
        updateSchema: Framework.UpdateFramework,
      });

      const insert = Effect.fn(function* (input: Framework.CreateFramework) {
        const model = yield* Framework.make(input);
        yield* repository.insert(model);

        return model;
      });

      const update = Effect.fn(function* ({
        id,
        data,
      }: {
        id: Framework.FrameworkId;
        data: Framework.UpdateFramework;
      }) {
        const model = yield* repository.getById(id);
        if (Option.isNone(model)) {
          return Option.none();
        }

        const updatedModel = model.value.update(data);

        yield* repository.update(updatedModel);

        return Option.some(updatedModel);
      });

      const getByOrganization = Effect.fn(function* (organizationId: string) {
        const { sql } = yield* Repository;
        return sql`SELECT * FROM ${sql("framework")} WHERE organization_id = ${organizationId} AND deleted_at IS NULL`.query(Framework.Framework);
      });

      return {
        ...repository,
        insert,
        update,
        getByOrganization,
      };
    }),
  },
) {}
