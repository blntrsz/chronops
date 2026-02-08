import { Effect } from "effect";
import { PolicyContract } from "./contract";
import { PolicyService } from "./service";

export const PolicyHandler = PolicyContract.toLayer(
  Effect.gen(function* () {
    const service = yield* PolicyService;

    return {
      PolicyById: ({ id }) => service.getById(id),
      PolicyCreate: (payload) => service.insert(payload),
      PolicyList: ({ page, size, status, ownerId, controlId }) =>
        service.list({ page, size }, { status, ownerId, controlId }),
      PolicyUpdate: (payload) => service.update(payload),
      PolicyRemove: ({ id }) => service.remove(id),
    };
  }),
);
