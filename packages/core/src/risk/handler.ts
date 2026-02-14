import { Effect, Layer } from "effect";
import { RiskContract } from "./contract";
import { RiskService } from "./service";

export const RiskHandler = RiskContract.toLayer(
  Effect.gen(function* () {
    const service = yield* RiskService;

    return {
      RiskById: ({ id }) => service.getById(id),
      RiskCreate: (payload) => service.insert(payload),
      RiskList: ({ page, size, controlId, status, likelihood, impact, treatment }) =>
        service.list({ page, size }, { controlId, status, likelihood, impact, treatment }),
      RiskUpdate: (payload) => service.update(payload),
      RiskRemove: ({ id }) => service.remove(id),
    };
  }),
).pipe(Layer.provide(RiskService.Default));
