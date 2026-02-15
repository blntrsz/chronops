import { Effect, Layer } from "effect";
import { ControlContract } from "./contract";
import { ControlService } from "./service";

export const ControlHandler = ControlContract.toLayer(
  Effect.gen(function* () {
    const service = yield* ControlService;

    return {
      ControlById: ({ id }) => service.getById(id),
      ControlCreate: (payload) => service.insert(payload),
      ControlList: ({ page, size, frameworkId }) => service.list({ page, size }, { frameworkId }),
      ControlUpdate: (payload) => service.update(payload),
      ControlRemove: ({ id }) => service.remove(id),
    };
  }),
).pipe(Layer.provide(ControlService.Default));
