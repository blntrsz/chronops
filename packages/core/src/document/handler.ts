import { Effect } from "effect";
import { DocumentContract } from "./contract";
import { DocumentService } from "./service";

export const DocumentHandler = DocumentContract.toLayer(
  Effect.gen(function* () {
    const service = yield* DocumentService;

    return {
      DocumentById: service.getById,
      DocumentCreate: service.insert,
      DocumentList: service.list,
      DocumentUpdate: service.update,
      DocumentRemove: service.remove,
      DocumentCount: service.count,
    };
  }),
);
