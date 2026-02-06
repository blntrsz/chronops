import { Cron, DateTime, Effect } from "effect";
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
  return ScheduleId.make(`sch_${createId()}`);
});

/**
 * Trigger types for schedules
 * @since 1.0.0
 */
export const TriggerType = Schema.Union(
  Schema.Literal("workflow_instance"),
  Schema.Literal("questioner"),
  Schema.Literal("notification"),
);
export type TriggerType = typeof TriggerType.Type;

/**
 * Workflow instance trigger configuration
 * @since 1.0.0
 */
export const WorkflowInstanceTriggerConfig = Schema.Struct({
  type: Schema.Literal("workflow_instance"),
  workflowTemplateId: Schema.String,
  initialState: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
  assignedTo: Schema.optional(Schema.String),
});
export type WorkflowInstanceTriggerConfig = typeof WorkflowInstanceTriggerConfig.Type;

/**
 * Questioner trigger configuration
 * @since 1.0.0
 */
export const QuestionerTriggerConfig = Schema.Struct({
  type: Schema.Literal("questioner"),
  questionerId: Schema.String,
  entityId: Schema.String,
  entityType: Schema.String,
});
export type QuestionerTriggerConfig = typeof QuestionerTriggerConfig.Type;

/**
 * Notification trigger configuration
 * @since 1.0.0
 */
export const NotificationTriggerConfig = Schema.Struct({
  type: Schema.Literal("notification"),
  templateId: Schema.String,
  recipientIds: Schema.Array(Schema.String),
  channel: Schema.Union(Schema.Literal("email"), Schema.Literal("slack"), Schema.Literal("in_app")),
});
export type NotificationTriggerConfig = typeof NotificationTriggerConfig.Type;

/**
 * Union of all trigger configurations
 * @since 1.0.0
 */
export const TriggerConfig = Schema.Union(
  WorkflowInstanceTriggerConfig,
  QuestionerTriggerConfig,
  NotificationTriggerConfig,
);
export type TriggerConfig = typeof TriggerConfig.Type;

/**
 * Concurrency policy for schedule execution
 * @since 1.0.0
 */
export const ConcurrencyPolicy = Schema.Union(
  Schema.Literal("allow"),
  Schema.Literal("skip"),
  Schema.Literal("queue"),
);
export type ConcurrencyPolicy = typeof ConcurrencyPolicy.Type;

/**
 * Run policy configuration
 * @since 1.0.0
 */
export const RunPolicy = Schema.Struct({
  maxRetries: Schema.Number,
  retryDelay: Schema.Number,
  concurrency: ConcurrencyPolicy,
  timeout: Schema.Number,
});
export type RunPolicy = typeof RunPolicy.Type;

/**
 * Default run policy values
 * @since 1.0.0
 */
export const defaultRunPolicy: RunPolicy = {
  maxRetries: 3,
  retryDelay: 5,
  concurrency: "skip",
  timeout: 30,
};

/**
 * Schedule model
 * @since 1.0.0
 * @category models
 */
export class Schedule extends Base.Base.extend<Schedule>("Schedule")({
  id: ScheduleId,
  name: Schema.String,
  description: Schema.NullOr(Schema.String),
  cadence: Schema.String,
  timeZone: Schema.String,
  startDate: Schema.NullOr(Schema.DateTimeUtc),
  endDate: Schema.NullOr(Schema.DateTimeUtc),
  triggerType: TriggerType,
  triggerConfig: TriggerConfig,
  runPolicy: RunPolicy,
  enabled: Schema.Boolean,
  lastRunAt: Schema.NullOr(Schema.DateTimeUtc),
  nextRunAt: Schema.NullOr(Schema.DateTimeUtc),
  runCount: Schema.Number,
  failureCount: Schema.Number,
}) {}

export const CreateSchedule = Schedule.pipe(
  Schema.pick("name", "description", "cadence", "timeZone", "startDate", "endDate", "triggerType", "triggerConfig"),
  Schema.extend(
    Schema.Struct({
      runPolicy: Schema.optionalWith(RunPolicy, { default: () => defaultRunPolicy }),
    }),
  ),
);
export type CreateSchedule = typeof CreateSchedule.Type;

export const UpdateSchedule = Schema.partial(
  Schedule.pipe(
    Schema.pick("name", "description", "cadence", "timeZone", "startDate", "endDate", "triggerType", "triggerConfig", "runPolicy", "enabled"),
  ),
);
export type UpdateSchedule = typeof UpdateSchedule.Type;

/**
 * Validate cron expression
 * @since 1.0.0
 */
export const validateCadence = (cadence: string) =>
  Effect.gen(function* () {
    const result = yield* Cron.parse(cadence);
    return result;
  });

/**
 * Calculate next run time from cadence
 * @since 1.0.0
 */
export const calculateNextRun = (cadence: string, timeZone: string, from?: DateTime.DateTime.Utc) =>
  Effect.gen(function* () {
    const cron = yield* Cron.parse(cadence);
    const now = from ?? (yield* DateTime.now);
    return Cron.next(cron, now, timeZone);
  });

/**
 * Create a new Schedule
 * @since 1.0.0
 */
export const make = Effect.fn(function* (input: CreateSchedule) {
  const base = yield* Base.makeBase();
  const now = yield* DateTime.now;

  const nextRunAt = yield* calculateNextRun(input.cadence, input.timeZone, now);

  return Schedule.make({
    id: yield* scheduleId(),
    ...input,
    runPolicy: input.runPolicy ?? defaultRunPolicy,
    enabled: true,
    lastRunAt: null,
    nextRunAt,
    runCount: 0,
    failureCount: 0,
    ...base,
  });
});

/**
 * Update an existing Schedule
 * @since 1.0.0
 */
export const update = Effect.fn(function* (model: Schedule, input: UpdateSchedule) {
  const base = yield* Base.updateBase();

  let nextRunAt = model.nextRunAt;

  if (input.cadence || input.timeZone) {
    const cadence = input.cadence ?? model.cadence;
    const timeZone = input.timeZone ?? model.timeZone;
    nextRunAt = yield* calculateNextRun(cadence, timeZone);
  }

  return Schedule.make({
    ...model,
    ...input,
    nextRunAt,
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
 * Enable a schedule
 * @since 1.0.0
 */
export const enable = Effect.fn(function* (model: Schedule) {
  const base = yield* Base.updateBase();

  const now = yield* DateTime.now;
  const nextRunAt = yield* calculateNextRun(model.cadence, model.timeZone, now);

  return Schedule.make({
    ...model,
    enabled: true,
    nextRunAt,
    ...base,
  });
});

/**
 * Disable a schedule
 * @since 1.0.0
 */
export const disable = Effect.fn(function* (model: Schedule) {
  const base = yield* Base.updateBase();

  return Schedule.make({
    ...model,
    enabled: false,
    nextRunAt: null,
    ...base,
  });
});

/**
 * Record a successful run
 * @since 1.0.0
 */
export const recordRun = Effect.fn(function* (model: Schedule) {
  const base = yield* Base.updateBase();
  const now = yield* DateTime.now;

  const nextRunAt = yield* calculateNextRun(model.cadence, model.timeZone, now);

  return Schedule.make({
    ...model,
    lastRunAt: now,
    nextRunAt,
    runCount: model.runCount + 1,
    ...base,
  });
});

/**
 * Record a failed run
 * @since 1.0.0
 */
export const recordFailure = Effect.fn(function* (model: Schedule) {
  const base = yield* Base.updateBase();

  return Schedule.make({
    ...model,
    failureCount: model.failureCount + 1,
    ...base,
  });
});

/**
 * Check if schedule is ready to run
 * @since 1.0.0
 */
export const isReadyToRun = (model: Schedule, now: DateTime.DateTime.Utc) => {
  if (!model.enabled) return false;
  if (model.nextRunAt === null) return false;

  const isAfterNextRun = DateTime.greaterThanOrEqualTo(now, model.nextRunAt);

  if (model.startDate && DateTime.lessThan(now, model.startDate)) {
    return false;
  }

  if (model.endDate && DateTime.greaterThan(now, model.endDate)) {
    return false;
  }

  return isAfterNextRun;
};

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

/**
 * Invalid cadence error
 * @since 1.0.0
 * @category errors
 */
export class InvalidCadenceError extends Schema.TaggedError<InvalidCadenceError>("InvalidCadenceError")(
  "InvalidCadenceError",
  {
    cadence: Schema.String,
    message: Schema.String,
  },
) {}
