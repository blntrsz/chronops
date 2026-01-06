import { Effect, Option } from "effect";
import * as Repository from "../common/repository";
import { Document } from "@chronops/domain";

export class DocumentService extends Effect.Service<DocumentService>()(
  "DocumentService",
  {
    effect: Effect.gen(function* () {
      const repository = yield* Repository.make({
        id: Document.DocumentId,
        model: Document.Document,
        tableName: "document",
      });

      const insert = Effect.fn(function* (input: Document.CreateDocument) {
        const model = yield* Document.make(input);
        yield* repository.save(model);

        return model;
      });

      const update = Effect.fn(function* ({
        id,
        data,
      }: {
        id: Document.DocumentId;
        data: Document.UpdateDocument;
      }) {
        const model = yield* repository.getById(id);
        if (Option.isNone(model)) {
          return yield* Document.DocumentNotFoundError.fromId(id);
        }

        const updatedModel = yield* Document.update(model.value, data);

        yield* repository.save(updatedModel);

        return updatedModel;
      });

      const remove = Effect.fn(function* (id: Document.DocumentId) {
        const model = yield* repository.getById(id);
        if (Option.isNone(model)) {
          return yield* Document.DocumentNotFoundError.fromId(id);
        }

        const deletedModel = yield* Document.remove(model.value);

        yield* repository.save(deletedModel);
      });

      return {
        getById: repository.getById,
        list: repository.list,
        insert,
        update,
        remove,
      };
    }),
  },
) {}
