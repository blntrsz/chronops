import { Effect, Layer } from "effect";
import { QuestionerContract } from "./contract";
import { QuestionerService } from "./service";

export const QuestionerHandler = QuestionerContract.toLayer(
  Effect.gen(function* () {
    const service = yield* QuestionerService;

    return {
      QuestionerInstanceById: ({ id }) => service.getByIdInstance(id),
      QuestionerInstanceCreate: (payload) => service.insertInstance(payload),
      QuestionerInstanceList: ({ page, size, templateId }) =>
        service.listInstance({ page, size }, { templateId }),
      QuestionerInstanceUpdate: (payload) => service.updateInstance(payload),
      QuestionerInstanceSubmit: ({ id }) => service.submitInstance(id),
      QuestionerInstanceRemove: ({ id }) => service.removeInstance(id),
      QuestionerTemplateById: ({ id }) => service.getByIdTemplate(id),
      QuestionerTemplateCreate: (payload) => service.insertTemplate(payload),
      QuestionerTemplateList: ({ page, size }) => service.listTemplate({ page, size }),
      QuestionerTemplateUpdate: (payload) => service.updateTemplate(payload),
      QuestionerTemplateRemove: ({ id }) => service.removeTemplate(id),
    };
  }),
).pipe(Layer.provide(QuestionerService.Default));
