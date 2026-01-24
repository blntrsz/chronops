import { Effect } from "effect";
import { CommentContract } from "./contract";
import { CommentService } from "./service";

export const CommentHandler = CommentContract.toLayer(
  Effect.gen(function* () {
    const service = yield* CommentService;
    return {
      CommentCreate: service.insert,
      CommentListByTarget: ({ entityId }) => service.listByTarget(entityId),
    };
  }),
);
