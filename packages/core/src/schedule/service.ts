import { DateTime, Effect } from "effect";
import { and, eq, or, isNull, lt } from "drizzle-orm";
import { Schedule, ScheduleRun } from "@chronops/domain";
import { Database } from "../db";

export class ScheduleService extends Effect.Service<ScheduleService>()("ScheduleService", {
  effect: Effect.gen(function* () {
    const { use, tables } = yield* Database;

    const listDueSchedules = Effect.fn(function* () {
      const now = yield* DateTime.now;
      const startOfDay = DateTime.startOf(now, "day");

      const models = yield* use((db) =>
        db.query.schedule.findMany({
          where: and(
            isNull(tables.schedule.deletedAt),
            or(isNull(tables.schedule.lastRanAt), lt(tables.schedule.lastRanAt, startOfDay)),
          ),
        }),
      );

      return models.map((model) => Schedule.Schedule.make(model));
    });

    const runSchedule = Effect.fn(function* <A, E, R>(
      schedule: Schedule.Schedule,
      callback: Effect.Effect<A, E, R>,
    ) {
      const run = yield* ScheduleRun.make({ scheduleId: schedule.id });
      yield* use((db) => db.insert(tables.scheduleRun).values(run));

      const result = yield* Effect.either(callback);
      const updatedRun =
        result._tag === "Right"
          ? yield* ScheduleRun.markSuccess(run)
          : yield* ScheduleRun.markFailure(run);

      yield* use((db) =>
        db
          .update(tables.scheduleRun)
          .set({
            status: updatedRun.status,
            success: updatedRun.success,
            updatedAt: updatedRun.updatedAt,
          })
          .where(eq(tables.scheduleRun.id, updatedRun.id)),
      );

      yield* use((db) =>
        db
          .update(tables.schedule)
          .set({
            lastRanAt: updatedRun.updatedAt,
            updatedAt: updatedRun.updatedAt,
          })
          .where(eq(tables.schedule.id, schedule.id)),
      );

      return result;
    });

    return {
      listDueSchedules,
      runSchedule,
    };
  }),
}) {}
