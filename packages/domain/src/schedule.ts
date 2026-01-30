import { Cron, DateTime, Effect, Either } from "effect";
import * as Schema from "effect/Schema";
import * as Base from "./base";

export const ScheduleId = Schema.String.pipe(Schema.brand("ScheduleId"));
export type ScheduleId = typeof ScheduleId.Type;

export const ScheduleHistoryId = Schema.String.pipe(Schema.brand("ScheduleHistoryId"));
export type ScheduleHistoryId = typeof ScheduleHistoryId.Type;

export const scheduleId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return ScheduleId.make(`sch_${createId()}`);
});

export const scheduleHistoryId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return ScheduleHistoryId.make(`schh_${createId()}`);
});

export const TriggerType = Schema.Literal("workflow_instance", "questioner", "notification");
export type TriggerType = typeof TriggerType.Type;

export const WorkflowInstanceTriggerConfig = Schema.Struct({
  workflowTemplateId: Schema.String,
  initialState: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
  assignedTo: Schema.optional(Schema.String),
});
export type WorkflowInstanceTriggerConfig = typeof WorkflowInstanceTriggerConfig.Type;

export const QuestionerTriggerConfig = Schema.Struct({
  questionerId: Schema.String,
  entityId: Schema.String,
  entityType: Schema.String,
});
export type QuestionerTriggerConfig = typeof QuestionerTriggerConfig.Type;

export const NotificationTriggerConfig = Schema.Struct({
  templateId: Schema.String,
  recipientIds: Schema.Array(Schema.String),
  channel: Schema.Literal("email", "slack", "in_app"),
});
export type NotificationTriggerConfig = typeof NotificationTriggerConfig.Type;

export const TriggerConfig = Schema.Union(
  WorkflowInstanceTriggerConfig,
  QuestionerTriggerConfig,
  NotificationTriggerConfig,
);
export type TriggerConfig = typeof TriggerConfig.Type;

export const RunPolicy = Schema.Struct({
  maxRetries: Schema.Number,
  retryDelayMinutes: Schema.Number,
  concurrency: Schema.Literal("allow", "skip", "queue"),
  timeoutMinutes: Schema.Number,
});
export type RunPolicy = typeof RunPolicy.Type;

export const defaultRunPolicy: RunPolicy = {
  maxRetries: 3,
  retryDelayMinutes: 5,
  concurrency: "skip",
  timeoutMinutes: 30,
};

export const ScheduleStatus = Schema.Literal("active", "paused", "archived");
export type ScheduleStatus = typeof ScheduleStatus.Type;

export const HistoryStatus = Schema.Literal(
  "pending",
  "running",
  "success",
  "failure",
  "timeout",
  "skipped",
);
export type HistoryStatus = typeof HistoryStatus.Type;

export class Schedule extends Base.Base.extend<Schedule>("Schedule")({
  id: ScheduleId,
  name: Schema.String,
  description: Schema.NullOr(Schema.String),
  cronExpression: Schema.String,
  timeZone: Schema.String,
  startDate: Schema.NullOr(Schema.DateTimeUtc),
  endDate: Schema.NullOr(Schema.DateTimeUtc),
  triggerType: TriggerType,
  triggerConfig: TriggerConfig,
  runPolicy: RunPolicy,
  status: ScheduleStatus,
  lastRunAt: Schema.NullOr(Schema.DateTimeUtc),
  nextRunAt: Schema.NullOr(Schema.DateTimeUtc),
  runCount: Schema.Number,
  failureCount: Schema.Number,
}) {}

export const CreateSchedule = Schema.Struct({
  name: Schema.String,
  description: Schema.optional(Schema.NullOr(Schema.String)),
  cronExpression: Schema.String,
  timeZone: Schema.optional(Schema.String),
  startDate: Schema.optional(Schema.NullOr(Schema.DateTimeUtc)),
  endDate: Schema.optional(Schema.NullOr(Schema.DateTimeUtc)),
  triggerType: TriggerType,
  triggerConfig: TriggerConfig,
  runPolicy: Schema.optional(RunPolicy),
});
export type CreateSchedule = typeof CreateSchedule.Type;

export const UpdateSchedule = Schema.Struct({
  name: Schema.optional(Schema.String),
  description: Schema.optional(Schema.NullOr(Schema.String)),
  cronExpression: Schema.optional(Schema.String),
  timeZone: Schema.optional(Schema.String),
  startDate: Schema.optional(Schema.NullOr(Schema.DateTimeUtc)),
  endDate: Schema.optional(Schema.NullOr(Schema.DateTimeUtc)),
  triggerType: Schema.optional(TriggerType),
  triggerConfig: Schema.optional(TriggerConfig),
  runPolicy: Schema.optional(RunPolicy),
  status: Schema.optional(ScheduleStatus),
});
export type UpdateSchedule = typeof UpdateSchedule.Type;

export class ScheduleHistory extends Base.Base.extend<ScheduleHistory>("ScheduleHistory")({
  id: ScheduleHistoryId,
  scheduleId: ScheduleId,
  triggeredAt: Schema.DateTimeUtc,
  status: HistoryStatus,
  result: Schema.NullOr(Schema.String),
  errorMessage: Schema.NullOr(Schema.String),
  retryCount: Schema.Number,
  completedAt: Schema.NullOr(Schema.DateTimeUtc),
}) {}

export const CreateScheduleHistory = Schema.Struct({
  scheduleId: ScheduleId,
  triggeredAt: Schema.DateTimeUtc,
  status: HistoryStatus,
  result: Schema.optional(Schema.NullOr(Schema.String)),
  errorMessage: Schema.optional(Schema.NullOr(Schema.String)),
  retryCount: Schema.optional(Schema.Number),
});
export type CreateScheduleHistory = typeof CreateScheduleHistory.Type;

export const UpdateScheduleHistory = Schema.Struct({
  status: Schema.optional(HistoryStatus),
  result: Schema.optional(Schema.NullOr(Schema.String)),
  errorMessage: Schema.optional(Schema.NullOr(Schema.String)),
  retryCount: Schema.optional(Schema.Number),
  completedAt: Schema.optional(Schema.NullOr(Schema.DateTimeUtc)),
});
export type UpdateScheduleHistory = typeof UpdateScheduleHistory.Type;

export const validateCron = (expression: string): Either.Either<Cron.Cron, string> => {
  const result = Cron.parse(expression);
  return Either.match(result, {
    onLeft: (error) => Either.left(`Invalid cron expression: ${error.message}`),
    onRight: (cron) => Either.right(cron),
  });
};

export const calculateNextRun = (
  cronExpression: string,
  timeZone: string,
  from?: DateTime.Utc,
): Either.Either<DateTime.Utc, string> => {
  const cronResult = Cron.parse(cronExpression, timeZone);

  return Either.flatMap(cronResult, (cron) => {
    try {
      const nextDate = Cron.next(cron, from ? DateTime.toDate(from) : undefined);
      const nextUtc = DateTime.unsafeFromDate(nextDate);
      return Either.right(nextUtc);
    } catch (error) {
      return Either.left(`Failed to calculate next run: ${error}`);
    }
  }).pipe(
    Either.mapLeft((error) =>
      typeof error === "string" ? error : `Invalid cron expression: ${error.message}`,
    ),
  );
};

export const make = Effect.fn(function* (input: CreateSchedule) {
  const base = yield* Base.makeBase();
  const now = yield* DateTime.now;

  const cronValidation = validateCron(input.cronExpression);
  if (Either.isLeft(cronValidation)) {
    return yield* Effect.fail(new InvalidCronError({ message: cronValidation.left }));
  }

  const nextRunResult = calculateNextRun(input.cronExpression, input.timeZone ?? "UTC", now);

  if (Either.isLeft(nextRunResult)) {
    return yield* Effect.fail(new InvalidCronError({ message: nextRunResult.left }));
  }

  return Schedule.make({
    id: yield* scheduleId(),
    name: input.name,
    description: input.description ?? null,
    cronExpression: input.cronExpression,
    timeZone: input.timeZone ?? "UTC",
    startDate: input.startDate ?? null,
    endDate: input.endDate ?? null,
    triggerType: input.triggerType,
    triggerConfig: input.triggerConfig,
    runPolicy: input.runPolicy ?? defaultRunPolicy,
    status: "active",
    lastRunAt: null,
    nextRunAt: nextRunResult.right,
    runCount: 0,
    failureCount: 0,
    ...base,
  });
});

export const update = Effect.fn(function* (schedule: Schedule, input: UpdateSchedule) {
  const base = yield* Base.updateBase();

  let nextRunAt = schedule.nextRunAt;

  if (input.cronExpression !== undefined || input.timeZone !== undefined) {
    const cronExpr = input.cronExpression ?? schedule.cronExpression;
    const tz = input.timeZone ?? schedule.timeZone;
    const now = yield* DateTime.now;

    const cronValidation = validateCron(cronExpr);
    if (Either.isLeft(cronValidation)) {
      return yield* Effect.fail(new InvalidCronError({ message: cronValidation.left }));
    }

    const nextRunResult = calculateNextRun(cronExpr, tz, now);
    if (Either.isRight(nextRunResult)) {
      nextRunAt = nextRunResult.right;
    }
  }

  return Schedule.make({
    ...schedule,
    ...(input.name !== undefined && { name: input.name }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.cronExpression !== undefined && { cronExpression: input.cronExpression }),
    ...(input.timeZone !== undefined && { timeZone: input.timeZone }),
    ...(input.startDate !== undefined && { startDate: input.startDate }),
    ...(input.endDate !== undefined && { endDate: input.endDate }),
    ...(input.triggerType !== undefined && { triggerType: input.triggerType }),
    ...(input.triggerConfig !== undefined && { triggerConfig: input.triggerConfig }),
    ...(input.runPolicy !== undefined && { runPolicy: input.runPolicy }),
    ...(input.status !== undefined && { status: input.status }),
    nextRunAt,
    ...base,
  });
});

export const remove = Effect.fn(function* (schedule: Schedule) {
  const base = yield* Base.removeBase();
  return Schedule.make({ ...schedule, status: "archived", ...base });
});

export const pause = Effect.fn(function* (schedule: Schedule) {
  const base = yield* Base.updateBase();
  return Schedule.make({ ...schedule, status: "paused", nextRunAt: null, ...base });
});

export const resume = Effect.fn(function* (schedule: Schedule) {
  const base = yield* Base.updateBase();
  const now = yield* DateTime.now;

  const nextRunResult = calculateNextRun(schedule.cronExpression, schedule.timeZone, now);

  return Schedule.make({
    ...schedule,
    status: "active",
    nextRunAt: Either.isRight(nextRunResult) ? nextRunResult.right : null,
    ...base,
  });
});

export const recordRun = Effect.fn(function* (schedule: Schedule, success: boolean) {
  const base = yield* Base.updateBase();
  const now = yield* DateTime.now;

  const nextRunResult = calculateNextRun(schedule.cronExpression, schedule.timeZone, now);

  return Schedule.make({
    ...schedule,
    lastRunAt: now,
    nextRunAt: Either.isRight(nextRunResult) ? nextRunResult.right : null,
    runCount: schedule.runCount + 1,
    failureCount: success ? schedule.failureCount : schedule.failureCount + 1,
    ...base,
  });
});

export const isReadyToRun = (schedule: Schedule, now: DateTime.Utc): boolean => {
  if (schedule.status !== "active") return false;
  if (schedule.nextRunAt === null) return false;
  if (DateTime.greaterThan(schedule.nextRunAt, now)) return false;

  if (schedule.startDate !== null && DateTime.lessThan(now, schedule.startDate)) {
    return false;
  }

  if (schedule.endDate !== null && DateTime.greaterThan(now, schedule.endDate)) {
    return false;
  }

  return true;
};

export const makeHistory = Effect.fn(function* (input: CreateScheduleHistory) {
  const base = yield* Base.makeBase();
  return ScheduleHistory.make({
    id: yield* scheduleHistoryId(),
    scheduleId: input.scheduleId,
    triggeredAt: input.triggeredAt,
    status: input.status,
    result: input.result ?? null,
    errorMessage: input.errorMessage ?? null,
    retryCount: input.retryCount ?? 0,
    completedAt: null,
    ...base,
  });
});

export const updateHistory = Effect.fn(function* (
  history: ScheduleHistory,
  input: UpdateScheduleHistory,
) {
  const base = yield* Base.updateBase();
  return ScheduleHistory.make({
    ...history,
    ...(input.status !== undefined && { status: input.status }),
    ...(input.result !== undefined && { result: input.result }),
    ...(input.errorMessage !== undefined && { errorMessage: input.errorMessage }),
    ...(input.retryCount !== undefined && { retryCount: input.retryCount }),
    ...(input.completedAt !== undefined && { completedAt: input.completedAt }),
    ...base,
  });
});

export const completeHistory = Effect.fn(function* (history: ScheduleHistory, result?: string) {
  const base = yield* Base.updateBase();
  const now = yield* DateTime.now;
  return ScheduleHistory.make({
    ...history,
    status: "success",
    result: result ?? null,
    completedAt: now,
    ...base,
  });
});

export const failHistory = Effect.fn(function* (history: ScheduleHistory, errorMessage: string) {
  const base = yield* Base.updateBase();
  const now = yield* DateTime.now;
  return ScheduleHistory.make({
    ...history,
    status: "failure",
    errorMessage,
    completedAt: now,
    ...base,
  });
});

export class ScheduleNotFoundError extends Base.NotFoundError {
  static override fromId(id: ScheduleId) {
    return new ScheduleNotFoundError({
      message: `Schedule with id ${id} not found.`,
      entityType: "Schedule",
      entityId: id,
    });
  }
}

export class ScheduleHistoryNotFoundError extends Base.NotFoundError {
  static override fromId(id: ScheduleHistoryId) {
    return new ScheduleHistoryNotFoundError({
      message: `ScheduleHistory with id ${id} not found.`,
      entityType: "ScheduleHistory",
      entityId: id,
    });
  }
}

export class InvalidCronError extends Schema.TaggedError<InvalidCronError>("InvalidCronError")(
  "InvalidCronError",
  {
    message: Schema.String,
  },
) {}
