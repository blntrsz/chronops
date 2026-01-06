import { Actor } from "@chronops/domain/actor";
import { SqlClient, SqlSchema } from "@effect/sql";
import type { SqlError } from "@effect/sql/SqlError";
import { Effect, Schema } from "effect";
import type { Option } from "effect/Option";
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
  const actor = yield* Actor;

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
  const getById = SqlSchema.findOne({
    Request: config.id,
    Result: config.model,
    execute(request) {
      return sql`SELECT * FROM ${sql(config.tableName)} ${sql.and([
        sql`id = ${request.id}`,
        sql`org_id = ${actor.orgId}`,
        sql`deleted_at IS NULL`,
      ])}`;
    },
  }) as (
    request: Schema.Schema.Type<typeof config.id>,
  ) => Effect.Effect<
    Option<Schema.Schema.Type<typeof config.model>>,
    SqlError | ParseError,
    never
  >;

  /**
   * List records with pagination.
   */
  const list = SqlSchema.findAll({
    Request: Pagination,
    Result: config.model,
    execute(request) {
      return sql`SELECT * FROM ${sql(`${config.tableName}`)} LIMIT ${request.size} OFFSET ${
        request.page * request.size
      } WHERE ${sql.and([
        sql`org_id = ${actor.orgId}`,
        sql`deleted_at IS NULL`,
      ])}`;
    },
  }) as (request: {
    readonly page: number;
    readonly size: number;
  }) => Effect.Effect<
    Schema.Schema.Type<typeof config.model>[],
    SqlError | ParseError,
    never
  >;

  /**
   * Delete a record by its ID.
   */
  const destroy = SqlSchema.void({
    Request: config.id,
    execute(request) {
      return sql`DELETE FROM ${sql(`${config.tableName}`)} WHERE ${sql.and([
        sql`id = ${request.id}`,
        sql`org_id = ${actor.orgId}`,
      ])}`;
    },
  }) as (
    request: Schema.Schema.Type<typeof config.id>,
  ) => Effect.Effect<void, ParseError | SqlError, never>;

  return { save, getById, list, destroy };
});
