import { Actor, Tag } from "@chronops/domain";
import { SqlClient, SqlSchema } from "@effect/sql";
import { Effect, Option, Schema } from "effect";
import * as Repository from "../common/repository";

export const EntityId = Schema.String.pipe(Schema.brand("EntityId"));
export type EntityId = typeof EntityId.Type;

export class TagService extends Effect.Service<TagService>()("TagService", {
  effect: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const repository = yield* Repository.make({
      id: Tag.TagId,
      model: Tag.Tag,
      tableName: "tag",
    });

    const insert = Effect.fn(function* (input: Schema.Schema.Type<typeof Tag.CreateTag>) {
      const model = yield* Tag.make(input);
      yield* repository.save(model);
      return model;
    });

    const update = Effect.fn(function* ({
      id,
      data,
    }: {
      id: Schema.Schema.Type<typeof Tag.TagId>;
      data: Schema.Schema.Type<typeof Tag.UpdateTag>;
    }) {
      const model = yield* repository.getById(id);
      if (Option.isNone(model)) {
        return yield* Effect.fail(Tag.TagNotFoundError.fromId(id));
      }

      const updatedModel = yield* Tag.update(model.value, data);
      yield* repository.save(updatedModel);
      return updatedModel;
    });

    const remove = Effect.fn(function* (id: Schema.Schema.Type<typeof Tag.TagId>) {
      const model = yield* repository.getById(id);
      if (Option.isNone(model)) {
        return yield* Effect.fail(Tag.TagNotFoundError.fromId(id));
      }

      const removedModel = yield* Tag.remove(model.value);
      yield* repository.save(removedModel);
    });

    const listByEntity = (entityId: EntityId) =>
      Effect.gen(function* () {
        const actor = yield* Actor.Actor;
        return yield* SqlSchema.findAll({
          Request: EntityId,
          Result: Tag.Tag,
          execute(req) {
            return sql`
              SELECT t.* FROM ${sql("tag")} t
              INNER JOIN ${sql("entity_tag")} et ON t.id = et.tag_id
              WHERE ${sql.and([
                sql`t.org_id = ${actor.orgId}`,
                sql`t.deleted_at IS NULL`,
                sql`et.entity_id = ${req}`,
                sql`et.org_id = ${actor.orgId}`,
              ])}
              ORDER BY t.name ASC
            `;
          },
        })(entityId);
      });

    const attachToEntity = Effect.fn(function* ({
      entityId,
      tagId,
    }: {
      entityId: EntityId;
      tagId: Schema.Schema.Type<typeof Tag.TagId>;
    }) {
      const actor = yield* Actor.Actor;

      const tag = yield* repository.getById(tagId);
      if (Option.isNone(tag)) {
        return yield* Effect.fail(Tag.TagNotFoundError.fromId(tagId));
      }

      yield* sql`
        INSERT INTO ${sql("entity_tag")} (entity_id, tag_id, org_id, created_at, created_by)
        VALUES (${entityId}, ${tagId}, ${actor.orgId}, NOW(), ${actor.memberId})
        ON CONFLICT (entity_id, tag_id) DO NOTHING
      `;
    });

    const detachFromEntity = Effect.fn(function* ({
      entityId,
      tagId,
    }: {
      entityId: EntityId;
      tagId: Schema.Schema.Type<typeof Tag.TagId>;
    }) {
      const actor = yield* Actor.Actor;

      yield* sql`
        DELETE FROM ${sql("entity_tag")}
        WHERE entity_id = ${entityId}
        AND tag_id = ${tagId}
        AND org_id = ${actor.orgId}
      `;
    });

    return {
      insert,
      update,
      remove,
      getById: repository.getById,
      list: repository.list,
      listByEntity,
      attachToEntity,
      detachFromEntity,
    };
  }),
}) {}
