import { Effect } from "effect";
import { DocumentContract } from "./contract";
import { DocumentService } from "./service";

export const DocumentHandler = DocumentContract.toLayer(
  Effect.gen(function* () {
    const service = yield* DocumentService;

    return {
      DocumentById: ({ id }) => service.getById(id),
      DocumentCreate: service.insert,
      DocumentList: service.list,
      DocumentUpdate: service.update,
      DocumentRemove: ({ id }) => service.remove(id),
      DocumentCount: service.count,
    };
  }),
);
