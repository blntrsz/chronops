import { Actor, Questioner } from "@chronops/domain";
import { SqlClient, SqlSchema } from "@effect/sql";
import { Effect, Option, Schema } from "effect";
import * as Repository from "../common/repository";

export const EntityId = Schema.String.pipe(Schema.brand("EntityId"));
export type EntityId = typeof EntityId.Type;

export class QuestionerService extends Effect.Service<QuestionerService>()("QuestionerService", {
  effect: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const repository = yield* Repository.make({
      id: Questioner.QuestionerId,
      model: Questioner.Questioner,
      tableName: "questioner",
    });

    const responseRepository = yield* Repository.make({
      id: Questioner.QuestionerResponseId,
      model: Questioner.QuestionerResponse,
      tableName: "questioner_response",
    });

    // Questioner operations
    const insert = Effect.fn(function* (input: Schema.Schema.Type<typeof Questioner.CreateQuestioner>) {
      const model = yield* Questioner.make(input);
      yield* repository.save(model);
      return model;
    });

    const update = Effect.fn(function* ({
      id,
      data,
    }: {
      id: Schema.Schema.Type<typeof Questioner.QuestionerId>;
      data: Schema.Schema.Type<typeof Questioner.UpdateQuestioner>;
    }) {
      const model = yield* repository.getById(id);
      if (Option.isNone(model)) {
        return yield* Effect.fail(Questioner.QuestionerNotFoundError.fromId(id));
      }

      const updatedModel = yield* Questioner.update(model.value, data);
      yield* repository.save(updatedModel);
      return updatedModel;
    });

    const remove = Effect.fn(function* (id: Schema.Schema.Type<typeof Questioner.QuestionerId>) {
      const model = yield* repository.getById(id);
      if (Option.isNone(model)) {
        return yield* Effect.fail(Questioner.QuestionerNotFoundError.fromId(id));
      }

      const removedModel = yield* Questioner.remove(model.value);
      yield* repository.save(removedModel);
    });

    // Response operations
    const insertResponse = Effect.fn(function* (
      input: Schema.Schema.Type<typeof Questioner.CreateQuestionerResponse>,
    ) {
      const model = yield* Questioner.makeResponse(input);
      yield* responseRepository.save(model);
      return model;
    });

    const updateResponse = Effect.fn(function* ({
      id,
      data,
    }: {
      id: Schema.Schema.Type<typeof Questioner.QuestionerResponseId>;
      data: Schema.Schema.Type<typeof Questioner.UpdateQuestionerResponse>;
    }) {
      const model = yield* responseRepository.getById(id);
      if (Option.isNone(model)) {
        return yield* Effect.fail(Questioner.QuestionerResponseNotFoundError.fromId(id));
      }

      const updatedModel = yield* Questioner.updateResponse(model.value, data);
      yield* responseRepository.save(updatedModel);
      return updatedModel;
    });

    const submitResponse = Effect.fn(function* ({
      id,
    }: {
      id: Schema.Schema.Type<typeof Questioner.QuestionerResponseId>;
    }) {
      const actor = yield* Actor.Actor;
      const model = yield* responseRepository.getById(id);
      if (Option.isNone(model)) {
        return yield* Effect.fail(Questioner.QuestionerResponseNotFoundError.fromId(id));
      }

      const submittedModel = yield* Questioner.submitResponse(model.value, actor.memberId);
      yield* responseRepository.save(submittedModel);
      return submittedModel;
    });

    const reviewResponse = Effect.fn(function* ({
      id,
      score,
      reviewNotes,
    }: {
      id: Schema.Schema.Type<typeof Questioner.QuestionerResponseId>;
      score: number;
      reviewNotes?: string | null;
    }) {
      const actor = yield* Actor.Actor;
      const model = yield* responseRepository.getById(id);
      if (Option.isNone(model)) {
        return yield* Effect.fail(Questioner.QuestionerResponseNotFoundError.fromId(id));
      }

      const reviewedModel = yield* Questioner.reviewResponse(model.value, {
        score,
        reviewNotes,
        reviewerId: actor.memberId,
      });
      yield* responseRepository.save(reviewedModel);
      return reviewedModel;
    });

    const removeResponse = Effect.fn(function* (
      id: Schema.Schema.Type<typeof Questioner.QuestionerResponseId>,
    ) {
      const model = yield* responseRepository.getById(id);
      if (Option.isNone(model)) {
        return yield* Effect.fail(Questioner.QuestionerResponseNotFoundError.fromId(id));
      }

      yield* responseRepository.destroy(id);
    });

    const listResponses = Effect.fn(function* ({
      questionerId,
      entityId,
      status,
      page,
      size,
    }: {
      questionerId?: Schema.Schema.Type<typeof Questioner.QuestionerId>;
      entityId?: EntityId;
      status?: Schema.Schema.Type<typeof Questioner.ResponseStatus>;
      page: number;
      size: number;
    }) {
      const actor = yield* Actor.Actor;

      const conditions = [
        sql`org_id = ${actor.orgId}`,
        sql`deleted_at IS NULL`,
      ];

      if (questionerId) {
        conditions.push(sql`questioner_id = ${questionerId}`);
      }

      if (entityId) {
        conditions.push(sql`entity_id = ${entityId}`);
      }

      if (status) {
        conditions.push(sql`status = ${status}`);
      }

      return yield* SqlSchema.findAll({
        Request: Schema.Struct({}),
        Result: Questioner.QuestionerResponse,
        execute() {
          return sql`SELECT * FROM ${sql("questioner_response")}
            WHERE ${sql.and(conditions)}
            ORDER BY created_at DESC
            LIMIT ${size} OFFSET ${(page - 1) * size}`;
        },
      })({});
    });

    return {
      // Questioner methods
      insert,
      update,
      remove,
      getById: repository.getById,
      list: repository.list,

      // Response methods
      insertResponse,
      updateResponse,
      submitResponse,
      reviewResponse,
      removeResponse,
      getResponseById: responseRepository.getById,
      listResponses,
    };
  }),
}) {}
