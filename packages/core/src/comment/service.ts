import { Actor, Comment } from "@chronops/domain";
import { SqlClient, SqlSchema } from "@effect/sql";
import { Effect, type Schema } from "effect";
import * as Repository from "../common/repository";

export class CommentService extends Effect.Service<CommentService>()("CommentService", {
  effect: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const repository = yield* Repository.make({
      id: Comment.CommentId,
      model: Comment.Comment,
      tableName: "comment",
    });

    const insert = Effect.fn(function* (input: Schema.Schema.Type<typeof Comment.CreateComment>) {
      const model = yield* Comment.make(input);
      yield* repository.save(model);
      return model;
    });

    const listByTarget = (entityId: Schema.Schema.Type<typeof Comment.CommentEntityId>) =>
      Effect.gen(function* () {
        const actor = yield* Actor.Actor;
        return yield* SqlSchema.findAll({
          Request: Comment.CommentEntityId,
          Result: Comment.Comment,
          execute(req) {
            return sql`SELECT * FROM ${sql("comment")}
              WHERE ${sql.and([
                sql`org_id = ${actor.orgId}`,
                sql`deleted_at IS NULL`,
                sql`entity_id = ${req}`,
              ])}
              ORDER BY created_at ASC`;
          },
        })(entityId);
      });

    return {
      insert,
      listByTarget,
    };
  }),
}) {}
