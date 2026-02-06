import { DateTime, Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Base from "./base";
import { ScheduleId } from "./schedule";

export const ScheduleRunId = Schema.String.pipe(Schema.brand("ScheduleRunId"));
export type ScheduleRunId = typeof ScheduleRunId.Type;

/**
 * Generate a new ScheduleRunId
 * @since 1.0.0
 */
export const scheduleRunId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return ScheduleRunId.make(`srn_${createId()}`);
});

/**
 * Schedule run statuses
 * @since 1.0.0
 */
export const ScheduleRunStatus = Schema.Union(
  Schema.Literal("pending"),
  Schema.Literal("running"),
  Schema.Literal("completed"),
  Schema.Literal("failed"),
  Schema.Literal("skipped"),
  Schema.Literal("timeout"),
);
export type ScheduleRunStatus = typeof ScheduleRunStatus.Type;

/**
 * Trigger result for successful runs
 * @since 1.0.0
 */
export const TriggerResult = Schema.Struct({
  type: Schema.String,
  entityId: Schema.optional(Schema.String),
  details: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
});
export type TriggerResult = typeof TriggerResult.Type;

/**
 * ScheduleRun model
 * Represents a single execution instance of a schedule
 * @since 1.0.0
 * @category models
 */
export class ScheduleRun extends Base.Base.extend<ScheduleRun>("ScheduleRun")({
  id: ScheduleRunId,
  scheduleId: ScheduleId,
  status: ScheduleRunStatus,
  triggeredAt: Schema.DateTimeUtc,
  startedAt: Schema.NullOr(Schema.DateTimeUtc),
  completedAt: Schema.NullOr(Schema.DateTimeUtc),
  result: Schema.NullOr(TriggerResult),
  error: Schema.NullOr(Schema.String),
  retryCount: Schema.Number,
});

export const CreateScheduleRun = ScheduleRun.pipe(Schema.pick("scheduleId"));
export type CreateScheduleRun = typeof CreateScheduleRun.Type;

export const UpdateScheduleRun = Schema.partial(
  ScheduleRun.pipe(
    Schema.pick("status", "startedAt", "completedAt", "result", "error", "retryCount"),
  ),
);
export type UpdateScheduleRun = typeof UpdateScheduleRun.Type;

/**
 * Create a new ScheduleRun
 * @since 1.0.0
 */
export const make = Effect.fn(function* (input: CreateScheduleRun) {
  const base = yield* Base.makeBase();
  const now = yield* DateTime.now;

  return ScheduleRun.make({
    id: yield* scheduleRunId(),
    scheduleId: input.scheduleId,
    status: "pending",
    triggeredAt: now,
    startedAt: null,
    completedAt: null,
    result: null,
    error: null,
    retryCount: 0,
    ...base,
  });
});

/**
 * Mark run as started
 * @since 1.0.0
 */
export const markStarted = Effect.fn(function* (model: ScheduleRun) {
  const base = yield* Base.updateBase();
  const now = yield* DateTime.now;

  return ScheduleRun.make({
    ...model,
    status: "running",
    startedAt: now,
    ...base,
  });
});

/**
 * Mark run as completed successfully
 * @since 1.0.0
 */
export const markCompleted = Effect.fn(function* (model: ScheduleRun, result: TriggerResult) {
  const base = yield* Base.updateBase();
  const now = yield* DateTime.now;

  return ScheduleRun.make({
    ...model,
    status: "completed",
    completedAt: now,
    result,
    error: null,
    ...base,
  });
});

/**
 * Mark run as failed
 * @since 1.0.0
 */
export const markFailed = Effect.fn(function* (model: ScheduleRun, error: string) {
  const base = yield* Base.updateBase();
  const now = yield* DateTime.now;

  return ScheduleRun.make({
    ...model,
    status: "failed",
    completedAt: now,
    error,
    ...base,
  });
});

/**
 * Mark run as skipped due to concurrency policy
 * @since 1.0.0
 */
export const markSkipped = Effect.fn(function* (model: ScheduleRun, reason: string) {
  const base = yield* Base.updateBase();
  const now = yield* DateTime.now;

  return ScheduleRun.make({
    ...model,
    status: "skipped",
    completedAt: now,
    error: reason,
    ...base,
  });
});

/**
 * Mark run as timed out
 * @since 1.0.0
 */
export const markTimeout = Effect.fn(function* (model: ScheduleRun) {
  const base = yield* Base.updateBase();
  const now = yield* DateTime.now;

  return ScheduleRun.make({
    ...model,
    status: "timeout",
    completedAt: now,
    error: "Execution exceeded timeout limit",
    ...base,
  });
});

/**
 * Increment retry count
 * @since 1.0.0
 */
export const incrementRetry = Effect.fn(function* (model: ScheduleRun) {
  const base = yield* Base.updateBase();

  return ScheduleRun.make({
    ...model,
    retryCount: model.retryCount + 1,
    ...base,
  });
});

/**
 * Calculate duration of the run in milliseconds
 * @since 1.0.0
 */
export const getDurationMs = (model: ScheduleRun): number | null => {
  if (!model.startedAt) return null;
  const end = model.completedAt ?? DateTime.unsafeNow();
  return DateTime.toMillis(end) - DateTime.toMillis(model.startedAt);
};

/**
 * Check if run is in a terminal state
 * @since 1.0.0
 */
export const isTerminal = (model: ScheduleRun): boolean => {
  return ["completed", "failed", "skipped", "timeout"].includes(model.status);
};

/**
 * Check if run can be retried
 * @since 1.0.0
 */
export const canRetry = (model: ScheduleRun, maxRetries: number): boolean => {
  return model.status === "failed" && model.retryCount < maxRetries;
};

/**
 * ScheduleRun not found error
 * @since 1.0.0
 * @category errors
 */
export class ScheduleRunNotFoundError extends Base.NotFoundError {
  static override fromId(id: ScheduleRunId) {
    return new ScheduleRunNotFoundError({
      message: `ScheduleRun with id ${id} not found.`,
      entityType: "ScheduleRun",
      entityId: id,
    });
  }
}
