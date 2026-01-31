import { Effect } from "effect";
import { ControlContract } from "./contract";
import { ControlService } from "./service";

export const ControlHandler = ControlContract.toLayer(
  Effect.gen(function* () {
    const service = yield* ControlService;

    return {
      ControlById: ({ id }) => service.getById(id),
      ControlCreate: service.insert,
      ControlList: ({ page, size, frameworkId }) => service.list({ page, size }, { frameworkId }),
      ControlUpdate: service.update,
      ControlRemove: ({ id }) => service.remove(id),
    };
  }),
);
