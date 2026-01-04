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
  TCreateSchema extends Schema.Schema<any>,
  TUpdateSchema extends Schema.Schema<any>,
  TIdSchema extends Schema.Schema<any>,
  TModelSchema extends Schema.Schema<any>,
> {
  tableName: string;
  createSchema: TCreateSchema;
  updateSchema: TUpdateSchema;
  id: TIdSchema;
  model: TModelSchema;
}

export const make = Effect.fn(function* <
  TCreateSchema extends Schema.Schema<any>,
  TUpdateSchema extends Schema.Schema<any>,
  TIdSchema extends Schema.Schema<any>,
  TModelSchema extends Schema.Schema<any>,
>(
  config: RepositoryConfig<
    TCreateSchema,
    TUpdateSchema,
    TIdSchema,
    TModelSchema
  >,
) {
  const sql = yield* SqlClient.SqlClient;

  /**
   * Insert a new record into the database.
   */
  const insert = SqlSchema.void({
    Request: config.createSchema,
    execute(request) {
      return sql`INSERT INTO ${sql(`${config.tableName}`)} ${sql.insert(request)}`;
    },
  }) as (
    request: Schema.Schema.Type<typeof config.createSchema>,
  ) => Effect.Effect<void, SqlError | ParseError, never>;

  /**
   * Get a record by its ID.
   */
  const getById = SqlSchema.findOne({
    Request: config.id,
    Result: config.model,
    execute(request) {
      return sql`SELECT * FROM ${sql(
        `${config.tableName}`,
      )} WHERE id = ${(request as unknown as { id: string }).id}`;
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
      }`;
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
   * Update an existing record.
   */
  const update = SqlSchema.void({
    Request: config.model,
    execute(request) {
      return sql`UPDATE ${sql(`${config.tableName}`)} SET ${sql.update(request)} WHERE id = ${request.id}`;
    },
  }) as (
    request: Schema.Schema.Type<typeof config.model>,
  ) => Effect.Effect<void, SqlError | ParseError, never>;

  /**
   * Delete a record by its ID.
   */
  const destroy = SqlSchema.void({
    Request: config.id,
    execute(request) {
      return sql`DELETE FROM ${sql(`${config.tableName}`)} WHERE id = ${(request as unknown as { id: string }).id}`;
    },
  }) as (
    request: Schema.Schema.Type<typeof config.id>,
  ) => Effect.Effect<void, ParseError | SqlError, never>;
  return { insert, getById, list, update, destroy };
});
