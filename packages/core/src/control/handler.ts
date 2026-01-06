import { Effect } from "effect";
import { ControlContract } from "./contract";
import { ControlService } from "./service";

export const ControlHandler = ControlContract.toLayer(
  Effect.gen(function* () {
    const service = yield* ControlService;

    return {
      ControlById: service.getById,
      ControlCreate: service.insert,
      ControlList: service.list,
      ControlUpdate: service.update,
      ControlDestroy: service.destroy,
      ControlByFramework: service.getByFramework,
      ControlByOrganization: service.getByOrganization,
    };
  }),
);
