import { Effect, Option, Schema } from "effect";
import { Actor, Document } from "@chronops/domain";
import { SqlClient, SqlSchema } from "@effect/sql";
import * as Repository from "../common/repository";

const CountResult = Schema.Struct({ count: Schema.NumberFromString });

export class DocumentService extends Effect.Service<DocumentService>()(
  "DocumentService",
  {
    effect: Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      const repository = yield* Repository.make({
        id: Document.DocumentId,
        model: Document.Document,
        tableName: "document",
      });

      const insert = Effect.fn(function* (input: Schema.Schema.Type<typeof Document.CreateDocument>) {
        const model = yield* Document.make(input);
        yield* repository.save(model);
        return model;
      });

      const update = Effect.fn(function* ({
        id,
        data,
      }: {
        id: Schema.Schema.Type<typeof Document.DocumentId>;
        data: Schema.Schema.Type<typeof Document.UpdateDocument>;
      }) {
        const model = yield* repository.getById(id);
        if (Option.isNone(model)) {
          return yield* Effect.fail(Document.DocumentNotFoundError.fromId(id));
        }

        const updatedModel = yield* Document.update(model.value, data);
        yield* repository.save(updatedModel);
        return updatedModel;
      });

      const remove = Effect.fn(function* (id: Schema.Schema.Type<typeof Document.DocumentId>) {
        const model = yield* repository.getById(id);
        if (Option.isNone(model)) {
          return yield* Effect.fail(Document.DocumentNotFoundError.fromId(id));
        }

        const removedModel = yield* Document.remove(model.value);
        yield* repository.save(removedModel);
      });

      const count = Effect.fn(function* () {
        const actor = yield* Actor.Actor;
        const result = yield* SqlSchema.findAll({
          Request: Schema.Void,
          Result: CountResult,
          execute() {
            return sql`SELECT COUNT(*) as count FROM ${sql("document")} WHERE ${sql.and(
              [sql`org_id = ${actor.orgId}`, sql`deleted_at IS NULL`],
            )}`;
          },
        })(undefined);
        return result[0]?.count ?? 0;
      });

      return {
        getById: repository.getById,
        list: repository.list,
        insert,
        update,
        remove,
        count,
      };

    }),
  },
) {}
