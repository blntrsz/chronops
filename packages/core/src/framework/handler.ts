import { Effect } from "effect";
import { FrameworkContract } from "./contract";
import { FrameworkService } from "./service";

export const FrameworkHandler = FrameworkContract.toLayer(
  Effect.gen(function* () {
    const service = yield* FrameworkService;

    return {
      FrameworkById: (req) => service.getById(req),
      FrameworkCreate: (req) => service.insert(req),
      FrameworkList: (req) => service.list(req),
      FrameworkUpdate: (req) => service.update(req),
      FrameworkDestroy: (req) => service.destroy(req),
    };
  }),
);
