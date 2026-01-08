import { Effect } from "effect";
import { Document, Workflow } from "@chronops/domain";
import { Actor } from "@chronops/domain/actor";
import { SqlClient } from "@effect/sql";
import * as CrudService from "../common/crud-service";

export class DocumentService extends Effect.Service<DocumentService>()(
  "DocumentService",
  {
    effect: Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      const service = yield* CrudService.makeCrudService({
        idSchema: Document.DocumentId,
        modelSchema: Document.Document,
        tableName: "document",
        entityType: "document",
        createInput: Document.CreateDocument,
        updateInput: Document.UpdateDocument,
        notFoundError: Document.DocumentNotFoundError,
        makeModel: Document.make,
        updateModel: Document.update,
        removeModel: Document.remove,
      });

      const count = Effect.fn(function* () {
        const actor = yield* Actor;
        const result = yield* sql`SELECT COUNT(*) as count FROM ${sql("document")} WHERE ${sql.and([
          sql`org_id = ${actor.orgId}`,
          sql`deleted_at IS NULL`,
        ])}`;
        return result[0]?.count ?? 0;
      });

      return {
        getById: service.getById,
        list: service.list,
        insert: service.insert,
        update: service.update,
        remove: service.remove,
        count,
      };
    }),
  },
) {}
