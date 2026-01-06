import { Effect, Option } from "effect";
import * as Repository from "../common/repository";
import { Control } from "@chronops/domain";

export class ControlService extends Effect.Service<ControlService>()(
  "ControlService",
  {
    effect: Effect.gen(function* () {
      const repository = yield* Repository.make({
        tableName: "control",
        model: Control.Control,
        id: Control.ControlId,
        createSchema: Control.CreateControl,
        updateSchema: Control.UpdateControl,
      });

      const insert = Effect.fn(function* (input: Control.CreateControl) {
        const model = yield* Control.make(input);
        yield* repository.insert(model);

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
          return Option.none();
        }

        const updatedModel = model.value.update(data);

        yield* repository.update(updatedModel);

        return Option.some(updatedModel);
      });

      const getByFramework = Effect.fn(function* (frameworkId: Control.Props["frameworkId"]) {
        const { sql } = yield* Repository;
        return sql`SELECT * FROM ${sql("control")} WHERE framework_id = ${frameworkId}`.query(Control.Control);
      });

      const getByOrganization = Effect.fn(function* (organizationId: string) {
        const { sql } = yield* Repository;
        return sql`
          SELECT c.* FROM ${sql("control")} c
          JOIN ${sql("framework")} f ON c.framework_id = f.id
          WHERE f.organization_id = ${organizationId} AND c.id IS NOT NULL
        `.query(Control.Control);
      });

      return {
        ...repository,
        insert,
        update,
        getByFramework,
        getByOrganization,
      };
    }),
  },
) {}
