import { Effect } from "effect";
import { AssessmentInstanceContract } from "./contract";
import { AssessmentInstanceService } from "./service";

export const AssessmentInstanceHandler = AssessmentInstanceContract.toLayer(
  Effect.gen(function* () {
    const service = yield* AssessmentInstanceService;

    return {
      AssessmentInstanceById: ({ id }) => service.getById(id),
      AssessmentInstanceCreate: (payload) => service.insert(payload),
      AssessmentInstanceList: ({ page, size, controlId, templateId }) =>
        service.list({ page, size }, { controlId, templateId }),
      AssessmentInstanceUpdate: (payload) => service.update(payload),
      AssessmentInstanceRemove: ({ id }) => service.remove(id),
    };
  }),
);
