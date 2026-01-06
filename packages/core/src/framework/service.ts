import { Effect, Option } from "effect";
import * as Repository from "../common/repository";
import { Framework } from "@chronops/domain";

export class FrameworkService extends Effect.Service<FrameworkService>()(
  "FrameworkService",
  {
    effect: Effect.gen(function* () {
      const repository = yield* Repository.make({
        id: Framework.FrameworkId,
        model: Framework.Framework,
        tableName: "framework",
      });

      const insert = Effect.fn(function* (input: Framework.CreateFramework) {
        const model = yield* Framework.make(input);
        yield* repository.save(model);

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
          return yield* Framework.FrameworkNotFoundError.fromId(id);
        }

        const updatedModel = yield* Framework.update(model.value, data);

        yield* repository.save(updatedModel);

        return updatedModel;
      });

      const remove = Effect.fn(function* (id: Framework.FrameworkId) {
        const model = yield* repository.getById(id);
        if (Option.isNone(model)) {
          return yield* Framework.FrameworkNotFoundError.fromId(id);
        }

        const deletedModel = yield* Framework.remove(model.value);

        yield* repository.save(deletedModel);
      });

      return {
        getById: repository.getById,
        list: repository.list,
        remove,
        insert,
        update,
      };
    }),
  },
) {}
