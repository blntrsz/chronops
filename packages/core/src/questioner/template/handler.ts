import { Effect } from "effect";
import { QuestionerTemplateContract } from "./contract";
import { QuestionerTemplateService } from "./service";

export const QuestionerTemplateHandler = QuestionerTemplateContract.toLayer(
  Effect.gen(function* () {
    const service = yield* QuestionerTemplateService;

    return {
      QuestionerTemplateById: ({ id }) => service.getById(id),
      QuestionerTemplateCreate: (payload) => service.insert(payload),
      QuestionerTemplateList: ({ page, size }) => service.list({ page, size }),
      QuestionerTemplateUpdate: (payload) => service.update(payload),
      QuestionerTemplateRemove: ({ id }) => service.remove(id),
    };
  }),
);
