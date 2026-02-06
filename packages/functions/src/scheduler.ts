import { DateTime, Effect } from "effect";
import { Schedule } from "@chronops/domain";
import { ScheduleService } from "@chronops/core/schedule/service";

export class Scheduler extends Effect.Service<Scheduler>()("Scheduler", {
  effect: Effect.gen(function* () {
    const scheduleService = yield* ScheduleService;

    const executeSchedule = Effect.fn(function* (schedule: Schedule.Schedule) {
      yield* Effect.log(`[Scheduler] Executing schedule: ${schedule.id}`);

      try {
        yield* Effect.log(`[Scheduler] Trigger type: ${schedule.triggerType}`);

        yield* scheduleService.runSchedule(
          schedule,
          Effect.log(`[Scheduler] Executed schedule ${schedule.id}`),
        );

        yield* Effect.log(`[Scheduler] Schedule ${schedule.id} completed successfully`);
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        yield* Effect.logError(`[Scheduler] Schedule ${schedule.id} failed: ${errorMessage}`);

        yield* scheduleService.runSchedule(
          schedule,
          Effect.fail(new Error(`[Scheduler] Failed schedule ${schedule.id}`)),
        );

        throw error;
      }
    });

    const run = Effect.fn(function* () {
      const now = yield* DateTime.now;
      yield* Effect.log(`[Scheduler] Starting scheduler run at ${now}`);

      const readySchedules = yield* scheduleService.listDueSchedules();
      yield* Effect.log(`[Scheduler] Found ${readySchedules.length} schedules ready to run`);

      if (readySchedules.length === 0) {
        yield* Effect.log("[Scheduler] No schedules to execute");
        return { executed: 0, failed: 0 };
      }

      let executed = 0;
      let failed = 0;

      for (const schedule of readySchedules) {
        const result = yield* Effect.either(executeSchedule(schedule));

        if (result._tag === "Right") {
          executed++;
        } else {
          failed++;
          yield* Effect.logError(
            `[Scheduler] Failed to execute schedule ${schedule.id}: ${result.left}`,
          );
        }
      }

      yield* Effect.log(`[Scheduler] Completed: ${executed} executed, ${failed} failed`);

      return { executed, failed };
    });

    return { run, executeSchedule };
  }),
}) {}
