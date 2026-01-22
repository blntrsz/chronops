import { Actor } from "@chronops/domain";
import { SqlClient, SqlSchema } from "@effect/sql";
import type { SqlError } from "@effect/sql/SqlError";
import { Effect, type Option, Schema } from "effect";

import type { ParseError } from "effect/ParseResult";

export const Pagination = Schema.Struct({
  page: Schema.Number,
  size: Schema.Number,
});

export interface RepositoryConfig<
  TIdSchema extends Schema.Schema<any>,
  TModelSchema extends Schema.Schema<any>,
> {
  tableName: string;
  id: TIdSchema;
  model: TModelSchema;
}

export const make = Effect.fn(function* <
  TIdSchema extends Schema.Schema<any>,
  TModelSchema extends Schema.Schema<any>,
>(config: RepositoryConfig<TIdSchema, TModelSchema>) {
  const sql = yield* SqlClient.SqlClient;

  /**
   * Save a new record. Create new entity if it does not exist. Update if it does.
   */
  const save = SqlSchema.void({
    Request: config.model,
    execute(request) {
      return sql`INSERT INTO ${sql(config.tableName)} ${sql.insert(request)} 
          ON CONFLICT (id) 
          DO UPDATE SET ${sql.update(request)}`;
    },
  }) as (
    request: Schema.Schema.Type<typeof config.model>,
  ) => Effect.Effect<void, SqlError | ParseError, never>;

  /**
   * Get a record by its ID.
   */
  const getById = ((request: Schema.Schema.Type<typeof config.id>) =>
    Effect.gen(function* () {
      const actor = yield* Actor.Actor;
      console.log({ actor });
      console.log({ request });
      const result = SqlSchema.findOne({
        Request: config.id,
        Result: config.model,
        execute(req) {
          const query = sql`SELECT * FROM ${sql(config.tableName)} 
            WHERE ${sql.and([
              sql`id = ${req}`,
              sql`org_id = ${actor.orgId}`,
              sql`deleted_at IS NULL`,
            ])}`;
          console.log({ query });
          return query;
        },
      })(request);

      console.log({ result });

      return yield* result;
    })) as (
    request: Schema.Schema.Type<typeof config.id>,
  ) => Effect.Effect<
    Option.Option<Schema.Schema.Type<typeof config.model>>,
    SqlError | ParseError,
    Actor.Actor
  >;

  /**
   * List records with pagination.
   */
  const list = ((request: Schema.Schema.Type<typeof Pagination>) =>
    Effect.gen(function* () {
      const actor = yield* Actor.Actor;
      return yield* SqlSchema.findAll({
        Request: Pagination,
        Result: config.model,
        execute(req) {
          return sql`SELECT * FROM ${sql(config.tableName)} 
            WHERE ${sql.and([sql`org_id = ${actor.orgId}`, sql`deleted_at IS NULL`])}
            LIMIT ${req.size} OFFSET ${(req.page - 1) * req.size}`;
        },
      })(request);
    })) as (
    request: Schema.Schema.Type<typeof Pagination>,
  ) => Effect.Effect<Schema.Schema.Type<typeof config.model>[], SqlError | ParseError, Actor.Actor>;

  /**
   * Delete a record by its ID.
   */
  const destroy = ((request: Schema.Schema.Type<typeof config.id>) =>
    Effect.gen(function* () {
      const actor = yield* Actor.Actor;
      return yield* SqlSchema.void({
        Request: config.id,
        execute(req) {
          return sql`DELETE FROM ${sql(config.tableName)} 
            WHERE ${sql.and([sql`id = ${req}`, sql`org_id = ${actor.orgId}`])}`;
        },
      })(request);
    })) as (
    request: Schema.Schema.Type<typeof config.id>,
  ) => Effect.Effect<void, ParseError | SqlError, Actor.Actor>;

  return { save, getById, list, destroy };
});
