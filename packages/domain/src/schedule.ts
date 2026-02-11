import { Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Base from "./base";

export const ScheduleId = Schema.String.pipe(Schema.brand("ScheduleId"));
export type ScheduleId = typeof ScheduleId.Type;

/**
 * Generate a new ScheduleId
 * @since 1.0.0
 */
export const scheduleId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return ScheduleId.make(Base.buildId("sch", createId));
});

/**
 * Trigger types for schedules
 * @since 1.0.0
 */
export const TriggerType = Schema.Union(Schema.Literal("once"), Schema.Literal("forever"));
export type TriggerType = typeof TriggerType.Type;

export const CronExpression = Schema.String.pipe(Schema.brand("CronExpression"));
export type CronExpression = typeof CronExpression.Type;

/**
 * Schedule model
 * @since 1.0.0
 * @category models
 */
export class Schedule extends Base.Base.extend<Schedule>("Schedule")({
  id: ScheduleId,
  ticket: Base.Ticket,
  cron: CronExpression,
  triggerType: TriggerType,
}) {}

export const CreateSchedule = Schedule.pipe(Schema.pick("cron", "triggerType"));
export type CreateSchedule = typeof CreateSchedule.Type;

export type CreateScheduleInput = CreateSchedule & { ticket: Base.Ticket };

export const UpdateSchedule = Schema.partial(Schedule.pipe(Schema.pick("cron", "triggerType")));
export type UpdateSchedule = typeof UpdateSchedule.Type;

/**
 * Create a new Schedule
 * @since 1.0.0
 */
export const make = Effect.fn(function* (input: CreateScheduleInput) {
  const base = yield* Base.makeBase();

  return Schedule.make({
    id: yield* scheduleId(),
    ...input,
    ...base,
  });
});

/**
 * Update an existing Schedule
 * @since 1.0.0
 */
export const update = Effect.fn(function* (model: Schedule, input: UpdateSchedule) {
  const base = yield* Base.updateBase();

  return Schedule.make({
    ...model,
    ...input,
    ...base,
  });
});

/**
 * Remove an existing Schedule
 * @since 1.0.0
 */
export const remove = Effect.fn(function* (model: Schedule) {
  const base = yield* Base.removeBase();

  return Schedule.make({
    ...model,
    ...base,
  });
});

/**
 * Schedule not found error
 * @since 1.0.0
 * @category errors
 */
export class ScheduleNotFoundError extends Base.NotFoundError {
  static override fromId(id: ScheduleId) {
    return new ScheduleNotFoundError({
      message: `Schedule with id ${id} not found.`,
      entityType: "Schedule",
      entityId: id,
    });
  }
}
