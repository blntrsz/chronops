import { Effect, Option } from "effect";

import { Workflow } from "@chronops/domain";

import * as Repository from "../common/repository";

export class WorkflowService extends Effect.Service<WorkflowService>()(
  "WorkflowService",
  {
    effect: Effect.gen(function* () {
      const repository = yield* Repository.make({
        id: Workflow.WorkflowId,
        model: Workflow.Workflow,
        tableName: "workflow",
      });

      const createForEntity = Effect.fn(function* (
        entityType: Workflow.WorkflowEntityType,
      ) {
        const model = yield* Workflow.make({ entityType });
        yield* repository.save(model);

        return model;
      });

      const transition = Effect.fn(function* ({
        id,
        event,
      }: {
        id: Workflow.WorkflowId;
        event: string;
      }) {
        const model = yield* repository.getById(id);
        if (Option.isNone(model)) {
          return yield* Effect.fail(Workflow.WorkflowNotFoundError.fromId(id));
        }

        const template = Workflow.templateForEntity(model.value.entityType);
        const nextStatus = Workflow.transition(template, model.value.status, event);
        if (Option.isNone(nextStatus)) {
          return yield* Effect.fail(
            Workflow.WorkflowInvalidTransitionError.from({
              entityType: model.value.entityType,
              from: model.value.status,
              event,
            }),
          );
        }

        const updated = yield* Workflow.updateStatus(model.value, nextStatus.value);
        yield* repository.save(updated);

        return updated;
      });

      return {
        createForEntity,
        transition,
        getById: repository.getById,
        list: repository.list,
      };
    }),
  },
) {}
