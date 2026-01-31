import { Effect } from "effect";
import { CommentContract } from "./contract";
import { CommentService } from "./service";

export const CommentHandler = CommentContract.toLayer(
  Effect.gen(function* () {
    const service = yield* CommentService;

    return {
      CommentById: ({ id }) => service.getById(id),
      CommentCreate: service.insert,
      CommentList: ({ page, size, entityId }) => service.list({ page, size }, { entityId }),
      CommentUpdate: service.update,
      CommentRemove: ({ id }) => service.remove(id),
    };
  }),
);
