import { Effect, Option, Schema } from "effect";
import type { SqlError } from "@effect/sql/SqlError";
import type { ParseError } from "effect/ParseResult";
import { Actor } from "@chronops/domain/actor";
import { Workflow, Base } from "@chronops/domain";
import * as Repository from "./repository";

export interface DomainConfig<
  TIdSchema extends Schema.Schema<any>,
  TModelSchema extends Schema.Schema<any>,
  TCreateInput extends Schema.Schema<any>,
  TUpdateInput extends Schema.Schema<any>,
  TError,
> {
  idSchema: TIdSchema;
  modelSchema: TModelSchema;
  tableName: string;
  entityType: Workflow.WorkflowEntityType;
  createInput: TCreateInput;
  updateInput: TUpdateInput;
  notFoundError: { fromId: (id: Schema.Schema.Type<TIdSchema>) => TError };
  makeModel: (input: Schema.Schema.Type<TCreateInput>, workflowId: Base.WorkflowId) => Effect.Effect<Schema.Schema.Type<TModelSchema>, never, Actor | Base.ULID>;
  updateModel: (model: Schema.Schema.Type<TModelSchema>, data: Schema.Schema.Type<TUpdateInput>) => Effect.Effect<Schema.Schema.Type<TModelSchema>, never, Actor | Base.ULID>;
  removeModel: (model: Schema.Schema.Type<TModelSchema>) => Effect.Effect<Schema.Schema.Type<TModelSchema>, never, Actor | Base.ULID>;
}

export interface CrudService<
  TIdSchema extends Schema.Schema<any>,
  TModelSchema extends Schema.Schema<any>,
  TCreateInput extends Schema.Schema<any>,
  TUpdateInput extends Schema.Schema<any>,
> {
  getById: (id: Schema.Schema.Type<TIdSchema>) => Effect.Effect<Option.Option<Schema.Schema.Type<TModelSchema>>, SqlError | ParseError, Actor>;
  list: (pagination: { page: number; size: number }) => Effect.Effect<Schema.Schema.Type<TModelSchema>[], SqlError | ParseError, Actor>;
  insert: (input: Schema.Schema.Type<TCreateInput>) => Effect.Effect<Schema.Schema.Type<TModelSchema>, SqlError | ParseError, Actor>;
  update: (input: { id: Schema.Schema.Type<TIdSchema>; data: Schema.Schema.Type<TUpdateInput> }) => Effect.Effect<Schema.Schema.Type<TModelSchema>, SqlError | ParseError | Schema.Schema.Type<TUpdateInput extends Schema.Schema<any, infer E> ? E : never>, Actor>;
  remove: (id: Schema.Schema.Type<TIdSchema>) => Effect.Effect<void, SqlError | ParseError | Schema.Schema.Type<TUpdateInput extends Schema.Schema<any, infer E> ? E : never>, Actor>;
}

export const makeCrudService = <
  TIdSchema extends Schema.Schema<any>,
  TModelSchema extends Schema.Schema<any>,
  TCreateInput extends Schema.Schema<any>,
  TUpdateInput extends Schema.Schema<any>,
  TError,
>(config: DomainConfig<TIdSchema, TModelSchema, TCreateInput, TUpdateInput, TError>) =>
  Effect.gen(function* () {
    const workflowRepository = yield* Repository.make({
      id: Workflow.WorkflowId,
      model: Workflow.Workflow,
      tableName: "workflow",
    });

    const repository = yield* Repository.make({
      id: config.idSchema,
      model: config.modelSchema,
      tableName: config.tableName,
    });

    const insert = Effect.fn(function* (input: Schema.Schema.Type<TCreateInput>) {
      const workflow = yield* Workflow.make({ entityType: config.entityType });
      yield* workflowRepository.save(workflow);

      const model = yield* config.makeModel(input, workflow.id);
      yield* repository.save(model);

      return model;
    });

    const update = Effect.fn(function* ({
      id,
      data,
    }: {
      id: Schema.Schema.Type<TIdSchema>;
      data: Schema.Schema.Type<TUpdateInput>;
    }) {
      const model = yield* repository.getById(id);
      if (Option.isNone(model)) {
        return yield* Effect.fail(config.notFoundError.fromId(id));
      }

      const updatedModel = yield* config.updateModel(model.value, data);
      yield* repository.save(updatedModel);

      return updatedModel;
    });

    const remove = Effect.fn(function* (id: Schema.Schema.Type<TIdSchema>) {
      const model = yield* repository.getById(id);
      if (Option.isNone(model)) {
        return yield* Effect.fail(config.notFoundError.fromId(id));
      }

      const deletedModel = yield* config.removeModel(model.value);
      yield* repository.save(deletedModel);
    });

    return {
      getById: repository.getById,
      list: repository.list,
      insert,
      update,
      remove,
    } as CrudService<TIdSchema, TModelSchema, TCreateInput, TUpdateInput>;
  });
