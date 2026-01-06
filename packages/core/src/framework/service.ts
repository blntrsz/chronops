import { Effect, Option } from "effect";

import { Framework, Workflow } from "@chronops/domain";

import * as Repository from "../common/repository";

export class FrameworkService extends Effect.Service<FrameworkService>()(
  "FrameworkService",
  {
    effect: Effect.gen(function* () {
      const workflowRepository = yield* Repository.make({
        id: Workflow.WorkflowId,
        model: Workflow.Workflow,
        tableName: "workflow",
      });

      const repository = yield* Repository.make({
        id: Framework.FrameworkId,
        model: Framework.Framework,
        tableName: "framework",
      });

      const insert = Effect.fn(function* (input: Framework.CreateFramework) {
        const workflow = yield* Workflow.make({ entityType: "framework" });
        yield* workflowRepository.save(workflow);

        const model = yield* Framework.make(input, workflow.id);
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
