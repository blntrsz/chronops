import { Effect } from "effect";
import { FrameworkContract } from "./contract";
import { FrameworkService } from "./service";

export const FrameworkHandler = FrameworkContract.toLayer(
  Effect.gen(function* () {
    const service = yield* FrameworkService;

    return {
      FrameworkById: ({ id }) => service.getById(id),
      FrameworkCreate: service.insert,
      FrameworkList: service.list,
      FrameworkUpdate: service.update,
      FrameworkRemove: ({ id }) => service.remove(id),
      FrameworkCount: service.count,
    };
  }),
);
