import { Actor, Schedule } from "@chronops/domain";
import { SqlClient, SqlSchema } from "@effect/sql";
import { DateTime, Effect, Option, Schema } from "effect";
import * as Repository from "../common/repository";

export class ScheduleService extends Effect.Service<ScheduleService>()("ScheduleService", {
  effect: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const repository = yield* Repository.make({
      id: Schedule.ScheduleId,
      model: Schedule.Schedule,
      tableName: "schedule",
    });

    const historyRepository = yield* Repository.make({
      id: Schedule.ScheduleHistoryId,
      model: Schedule.ScheduleHistory,
      tableName: "schedule_history",
    });

    // Schedule operations
    const insert = Effect.fn(function* (input: Schema.Schema.Type<typeof Schedule.CreateSchedule>) {
      const model = yield* Schedule.make(input);
      yield* repository.save(model);
      return model;
    });

    const update = Effect.fn(function* ({
      id,
      data,
    }: {
      id: Schema.Schema.Type<typeof Schedule.ScheduleId>;
      data: Schema.Schema.Type<typeof Schedule.UpdateSchedule>;
    }) {
      const model = yield* repository.getById(id);
      if (Option.isNone(model)) {
        return yield* Effect.fail(Schedule.ScheduleNotFoundError.fromId(id));
      }

      const updatedModel = yield* Schedule.update(model.value, data);
      yield* repository.save(updatedModel);
      return updatedModel;
    });

    const remove = Effect.fn(function* (id: Schema.Schema.Type<typeof Schedule.ScheduleId>) {
      const model = yield* repository.getById(id);
      if (Option.isNone(model)) {
        return yield* Effect.fail(Schedule.ScheduleNotFoundError.fromId(id));
      }

      const removedModel = yield* Schedule.remove(model.value);
      yield* repository.save(removedModel);
    });

    const pause = Effect.fn(function* (id: Schema.Schema.Type<typeof Schedule.ScheduleId>) {
      const model = yield* repository.getById(id);
      if (Option.isNone(model)) {
        return yield* Effect.fail(Schedule.ScheduleNotFoundError.fromId(id));
      }

      const pausedModel = yield* Schedule.pause(model.value);
      yield* repository.save(pausedModel);
      return pausedModel;
    });

    const resume = Effect.fn(function* (id: Schema.Schema.Type<typeof Schedule.ScheduleId>) {
      const model = yield* repository.getById(id);
      if (Option.isNone(model)) {
        return yield* Effect.fail(Schedule.ScheduleNotFoundError.fromId(id));
      }

      const resumedModel = yield* Schedule.resume(model.value);
      yield* repository.save(resumedModel);
      return resumedModel;
    });

    const listReadyToRun = Effect.fn(function* () {
      const actor = yield* Actor.Actor;
      const now = yield* DateTime.now;

      return yield* SqlSchema.findAll({
        Request: Schema.Struct({}),
        Result: Schedule.Schedule,
        execute() {
          return sql`
            SELECT * FROM ${sql("schedule")}
            WHERE ${sql.and([
              sql`org_id = ${actor.orgId}`,
              sql`status = 'active'`,
              sql`deleted_at IS NULL`,
              sql`next_run_at <= ${now}`,
              sql`(start_date IS NULL OR start_date <= ${now})`,
              sql`(end_date IS NULL OR end_date >= ${now})`,
            ])}
            ORDER BY next_run_at ASC
          `;
        },
      })({});
    });

    const recordRun = Effect.fn(function* ({
      id,
      success,
    }: {
      id: Schema.Schema.Type<typeof Schedule.ScheduleId>;
      success: boolean;
    }) {
      const model = yield* repository.getById(id);
      if (Option.isNone(model)) {
        return yield* Effect.fail(Schedule.ScheduleNotFoundError.fromId(id));
      }

      const updatedModel = yield* Schedule.recordRun(model.value, success);
      yield* repository.save(updatedModel);
      return updatedModel;
    });

    // History operations
    const insertHistory = Effect.fn(function* (
      input: Schema.Schema.Type<typeof Schedule.CreateScheduleHistory>,
    ) {
      const model = yield* Schedule.makeHistory(input);
      yield* historyRepository.save(model);
      return model;
    });

    const updateHistory = Effect.fn(function* ({
      id,
      data,
    }: {
      id: Schema.Schema.Type<typeof Schedule.ScheduleHistoryId>;
      data: Schema.Schema.Type<typeof Schedule.UpdateScheduleHistory>;
    }) {
      const model = yield* historyRepository.getById(id);
      if (Option.isNone(model)) {
        return yield* Effect.fail(Schedule.ScheduleHistoryNotFoundError.fromId(id));
      }

      const updatedModel = yield* Schedule.updateHistory(model.value, data);
      yield* historyRepository.save(updatedModel);
      return updatedModel;
    });

    const completeHistory = Effect.fn(function* ({
      id,
      result,
    }: {
      id: Schema.Schema.Type<typeof Schedule.ScheduleHistoryId>;
      result?: string;
    }) {
      const model = yield* historyRepository.getById(id);
      if (Option.isNone(model)) {
        return yield* Effect.fail(Schedule.ScheduleHistoryNotFoundError.fromId(id));
      }

      const completedModel = yield* Schedule.completeHistory(model.value, result);
      yield* historyRepository.save(completedModel);
      return completedModel;
    });

    const failHistory = Effect.fn(function* ({
      id,
      errorMessage,
    }: {
      id: Schema.Schema.Type<typeof Schedule.ScheduleHistoryId>;
      errorMessage: string;
    }) {
      const model = yield* historyRepository.getById(id);
      if (Option.isNone(model)) {
        return yield* Effect.fail(Schedule.ScheduleHistoryNotFoundError.fromId(id));
      }

      const failedModel = yield* Schedule.failHistory(model.value, errorMessage);
      yield* historyRepository.save(failedModel);
      return failedModel;
    });

    const listHistory = Effect.fn(function* ({
      scheduleId,
      status,
      page,
      size,
    }: {
      scheduleId?: Schema.Schema.Type<typeof Schedule.ScheduleId>;
      status?: Schema.Schema.Type<typeof Schedule.HistoryStatus>;
      page: number;
      size: number;
    }) {
      const actor = yield* Actor.Actor;

      const conditions = [
        sql`org_id = ${actor.orgId}`,
        sql`deleted_at IS NULL`,
      ];

      if (scheduleId) {
        conditions.push(sql`schedule_id = ${scheduleId}`);
      }

      if (status) {
        conditions.push(sql`status = ${status}`);
      }

      return yield* SqlSchema.findAll({
        Request: Schema.Struct({}),
        Result: Schedule.ScheduleHistory,
        execute() {
          return sql`SELECT * FROM ${sql("schedule_history")}
            WHERE ${sql.and(conditions)}
            ORDER BY triggered_at DESC
            LIMIT ${size} OFFSET ${(page - 1) * size}`;
        },
      })({});
    });

    return {
      // Schedule methods
      insert,
      update,
      remove,
      getById: repository.getById,
      list: repository.list,
      pause,
      resume,
      listReadyToRun,
      recordRun,

      // History methods
      insertHistory,
      updateHistory,
      completeHistory,
      failHistory,
      getHistoryById: historyRepository.getById,
      listHistory,
    };
  }),
}) {}
