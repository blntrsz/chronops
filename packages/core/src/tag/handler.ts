import { Effect } from "effect";
import { TagContract } from "./contract";
import { TagService } from "./service";

export const TagHandler = TagContract.toLayer(
  Effect.gen(function* () {
    const service = yield* TagService;
    return {
      TagCreate: service.insert,
      TagById: ({ id }) => service.getById(id),
      TagList: service.list,
      TagUpdate: service.update,
      TagRemove: ({ id }) => service.remove(id),
      TagListByEntity: ({ entityId }) => service.listByEntity(entityId),
      TagAttach: service.attachToEntity,
      TagDetach: service.detachFromEntity,
    };
  }),
);
