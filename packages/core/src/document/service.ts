import { Effect, Option } from "effect";
import * as Repository from "../common/repository";
import { Document } from "@chronops/domain";

export class DocumentService extends Effect.Service<DocumentService>()(
  "DocumentService",
  {
    effect: Effect.gen(function* () {
      const repository = yield* Repository.make({
        tableName: "document",
        model: Document.Document,
        id: Document.DocumentId,
        createSchema: Document.CreateDocument,
        updateSchema: Document.UpdateDocument,
      });

      const insert = Effect.fn(function* (input: Document.CreateDocument) {
        const model = yield* Document.make(input);
        yield* repository.insert(model);

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
          return Option.none();
        }

        const updatedModel = model.value.update(data);

        yield* repository.update(updatedModel);

        return Option.some(updatedModel);
      });

      const getByFramework = Effect.fn(function* (frameworkId: Document.Props["frameworkId"]) {
        const { sql } = yield* Repository;
        return sql`SELECT * FROM ${sql("document")} WHERE framework_id = ${frameworkId}`.query(Document.Document);
      });

      const getByControl = Effect.fn(function* (controlId: Document.Props["controlId"]) {
        const { sql } = yield* Repository;
        return sql`SELECT * FROM ${sql("document")} WHERE control_id = ${controlId}`.query(Document.Document);
      });

      return {
        ...repository,
        insert,
        update,
        getByFramework,
        getByControl,
      };
    }),
  },
) {}
