import { Effect } from "effect";
import { AssessmentTemplateContract } from "./contract";
import { AssessmentTemplateService } from "./service";

export const AssessmentTemplateHandler = AssessmentTemplateContract.toLayer(
  Effect.gen(function* () {
    const service = yield* AssessmentTemplateService;

    return {
      AssessmentTemplateById: ({ id }) => service.getById(id),
      AssessmentTemplateCreate: (payload) => service.insert(payload),
      AssessmentTemplateList: ({ page, size, controlId }) =>
        service.list({ page, size }, { controlId }),
      AssessmentTemplateUpdate: (payload) => service.update(payload),
      AssessmentTemplateRemove: ({ id }) => service.remove(id),
    };
  }),
);
