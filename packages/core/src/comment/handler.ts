import { Effect, Layer } from "effect";
import { CommentContract } from "./contract";
import { CommentService } from "./service";

export const CommentHandler = CommentContract.toLayer(
  Effect.gen(function* () {
    const service = yield* CommentService;

    return {
      CommentById: ({ id }) => service.getById(id),
      CommentCreate: (payload) => service.insert(payload),
      CommentList: ({ page, size, entityId }) => service.list({ page, size }, { entityId }),
      CommentUpdate: (payload) => service.update(payload),
      CommentRemove: ({ id }) => service.remove(id),
    };
  }),
).pipe(Layer.provide(CommentService.Default));
