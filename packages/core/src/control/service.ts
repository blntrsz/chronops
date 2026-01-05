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

      return {
        ...repository,
        insert,
        update,
      };
    }),
  },
) {}
