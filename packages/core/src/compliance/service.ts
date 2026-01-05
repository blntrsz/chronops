import { Effect, Option } from "effect";
import * as Repository from "../common/repository";
import { Compliance } from "@chronops/domain";

export class ComplianceService extends Effect.Service<ComplianceService>()(
  "ComplianceService",
  {
    effect: Effect.gen(function* () {
      const repository = yield* Repository.make({
        tableName: "compliances",
        model: Compliance.Compliance,
        id: Compliance.ComplianceId,
        createSchema: Compliance.CreateCompliance,
        updateSchema: Compliance.UpdateCompliance,
      });

      const insert = Effect.fn(function* (input: Compliance.CreateCompliance) {
        const model = yield* Compliance.make(input);
        yield* repository.insert(model);

        return model;
      });

      const update = Effect.fn(function* ({
        id,
        data,
      }: {
        id: Compliance.ComplianceId;
        data: Compliance.UpdateCompliance;
      }) {
        const model = yield* repository.getById(id);
        if (Option.isNone(model)) {
          return Option.none();
        }

        const updatedModel = model.value.update(data);

        yield* repository.update(updatedModel);

        return Option.some(updatedModel);
      });

      return {
        ...repository,
        insert,
        update,
      };
    }),
  },
) {}
