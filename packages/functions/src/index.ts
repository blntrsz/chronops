import { Effect } from "effect";
import { Database } from "@chronops/core/db";
import { Actor, Base } from "@chronops/domain";
import { Scheduler } from "./scheduler";
import { ScheduleService } from "@chronops/core/schedule/service";
import { ulid } from "ulid";
const program = Effect.gen(function* () {
  const scheduler = yield* Scheduler;
  const result = yield* scheduler.run();
  return result;
}).pipe(
  Effect.provide(Scheduler.Default),
  Effect.provide(ScheduleService.Default),
  Effect.provide(Database.Default),
  Effect.provideService(Base.ULID, { createId: ulid }),
  Effect.provideService(Actor.Actor, {
    memberId: Actor.MemberId.make("system"),
    orgId: Actor.OrgId.make("system"),
  }),
);

Effect.runPromise(program)
  .then((result) => {
    console.log(`[Functions] Completed: ${result.executed} schedules executed, ${result.failed} failed`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("[Functions] Fatal error:", error);
    process.exit(1);
  });
