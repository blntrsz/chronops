import { Effect } from "effect";
import { FrameworkContract } from "./contract";
import { FrameworkService } from "./service";

export const FrameworkHandler = FrameworkContract.toLayer(
  Effect.gen(function* () {
    const service = yield* FrameworkService;

    return {
      FrameworkById: ({ id }) => service.getById(id),
      FrameworkCreate: (payload) => service.insert(payload),
      FrameworkList: (payload) => service.list(payload),
      FrameworkUpdate: (payload) => service.update(payload),
      FrameworkRemove: ({ id }) => service.remove(id),
    };
  }),
);
