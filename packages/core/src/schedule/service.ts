import { and, eq, isNull } from "drizzle-orm";
import { DateTime, Effect } from "effect";
import { Actor, Base, Schedule, ScheduleRun } from "@chronops/domain";
import { ULID } from "@chronops/domain/src/base";
import { Database } from "../db";
import { TicketService } from "../ticket/service";

export class ScheduleService extends Effect.Service<ScheduleService>()("ScheduleService", {
  dependencies: [ULID.Default, Database.Default, TicketService.Default],
  effect: Effect.gen(function* () {
    const { use, tables } = yield* Database;
    const ticketService = yield* TicketService;

    const listDueSchedules = Effect.fn(function* () {
      const now = yield* DateTime.now;
      const startOfDay = DateTime.startOf(now, "day");

      const models = yield* use((db) =>
        db.query.schedule.findMany({
          where: and(isNull(tables.schedule.deletedAt)),
        }),
      );

      const due = yield* Effect.filter(models, (model) =>
        Effect.gen(function* () {
          const lastRun = yield* use((db) =>
            db.query.scheduleRun.findFirst({
              where: and(
                eq(tables.scheduleRun.scheduleId, model.id),
                isNull(tables.scheduleRun.deletedAt),
              ),
              orderBy: (scheduleRun, { desc }) => [desc(scheduleRun.updatedAt)],
            }),
          );

          if (!lastRun) {
            return true;
          }

          return DateTime.lessThan(lastRun.updatedAt, startOfDay);
        }),
      );

      return due.map((model) => Schedule.Schedule.make(model));
    });

    const runSchedule = Effect.fn(function* <A, E, R>(
      schedule: Schedule.Schedule,
      callback: Effect.Effect<A, E, R>,
    ) {
      const actor = yield* Actor.Actor;
      const ticket = yield* ticketService.next(actor.orgId, Base.TicketPrefix.make("SRN"));
      const run = yield* ScheduleRun.make({
        scheduleId: schedule.id,
        ticket,
      } as ScheduleRun.CreateScheduleRunInput);
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
            finishedAt: updatedRun.finishedAt,
            updatedAt: updatedRun.updatedAt,
          })
          .where(eq(tables.scheduleRun.id, updatedRun.id)),
      );

      return result;
    });

    return {
      listDueSchedules,
      runSchedule,
    };
  }),
}) {}
