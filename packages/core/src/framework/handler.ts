import { Effect } from "effect";
import { FrameworkContract } from "./contract";
import { FrameworkService } from "./service";

export const FrameworkHandler = FrameworkContract.toLayer(
  Effect.gen(function* () {
    const service = yield* FrameworkService;

    return {
      FrameworkById: service.getById,
      FrameworkCreate: service.insert,
      FrameworkList: service.list,
      FrameworkUpdate: service.update,
      FrameworkDestroy: service.destroy,
      FrameworkByOrganization: service.getByOrganization,
    };
  }),
);
