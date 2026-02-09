import { Effect } from "effect";
import { QuestionerInstanceContract } from "./contract";
import { QuestionerInstanceService } from "./service";

export const QuestionerInstanceHandler = QuestionerInstanceContract.toLayer(
  Effect.gen(function* () {
    const service = yield* QuestionerInstanceService;

    return {
      QuestionerInstanceById: ({ id }) => service.getById(id),
      QuestionerInstanceCreate: (payload) => service.insert(payload),
      QuestionerInstanceList: ({ page, size, templateId }) =>
        service.list({ page, size }, { templateId }),
      QuestionerInstanceUpdate: (payload) => service.update(payload),
      QuestionerInstanceSubmit: ({ id }) => service.submit(id),
      QuestionerInstanceRemove: ({ id }) => service.remove(id),
    };
  }),
);
