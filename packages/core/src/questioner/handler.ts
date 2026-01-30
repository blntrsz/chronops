import { Effect } from "effect";
import { QuestionerContract } from "./contract";
import { QuestionerService } from "./service";

export const QuestionerHandler = QuestionerContract.toLayer(
  Effect.gen(function* () {
    const service = yield* QuestionerService;
    return {
      // Questioner operations
      QuestionerCreate: service.insert,
      QuestionerById: ({ id }) => service.getById(id),
      QuestionerList: service.list,
      QuestionerUpdate: service.update,
      QuestionerRemove: ({ id }) => service.remove(id),

      // Response operations
      QuestionerResponseCreate: service.insertResponse,
      QuestionerResponseById: ({ id }) => service.getResponseById(id),
      QuestionerResponseList: service.listResponses,
      QuestionerResponseUpdate: service.updateResponse,
      QuestionerResponseSubmit: service.submitResponse,
      QuestionerResponseReview: service.reviewResponse,
      QuestionerResponseRemove: ({ id }) => service.removeResponse(id),
    };
  }),
);
