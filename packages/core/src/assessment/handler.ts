import { Effect, Layer } from "effect";
import { AssessmentService } from "./service";
import { AssessmentContract } from "./contract";

export const AssessmentHandler = AssessmentContract.toLayer(
  Effect.gen(function* () {
    const service = yield* AssessmentService;

    return {
      AssessmentInstanceById: ({ id }) => service.getByIdInstance(id),
      AssessmentInstanceCreate: (payload) => service.insertInstance(payload),
      AssessmentInstanceList: ({ page, size, controlId, templateId }) =>
        service.listInstance({ page, size }, { controlId, templateId }),
      AssessmentInstanceUpdate: (payload) => service.updateInstance(payload),
      AssessmentInstanceRemove: ({ id }) => service.removeInstance(id),
      AssessmentTemplateById: ({ id }) => service.getByIdTemplate(id),
      AssessmentTemplateCreate: (payload) => service.insertTemplate(payload),
      AssessmentTemplateList: ({ page, size, controlId }) =>
        service.listTemplate({ page, size }, { controlId }),
      AssessmentTemplateUpdate: (payload) => service.updateTemplate(payload),
      AssessmentTemplateRemove: ({ id }) => service.removeTemplate(id),
    };
  }),
).pipe(Layer.provide(AssessmentService.Default));
