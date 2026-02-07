import { DateTime, Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Base from "./base";
import { ScheduleId } from "./schedule";
import * as Workflow from "./workflow";

export const ScheduleRunId = Schema.String.pipe(Schema.brand("ScheduleRunId"));
export type ScheduleRunId = typeof ScheduleRunId.Type;

/**
 * Schedule run statuses
 * @since 1.0.0
 */
export const ScheduleRunStatus = Schema.Union(
  Schema.Literal("in_progress"),
  Schema.Literal("success"),
  Schema.Literal("failed"),
);
export type ScheduleRunStatus = typeof ScheduleRunStatus.Type;

/**
 * Workflow template for ScheduleRun entity
 * @since 1.0.0
 * @category workflows
 */
export const ScheduleRunTemplate = Workflow.WorkflowTemplate.make({
  initial: "in_progress",
  transitions: {
    in_progress: { succeed: "success", fail: "failed" },
    success: {},
    failed: {},
  },
});

export type ScheduleRunEvent = Workflow.EventOf<typeof ScheduleRunTemplate>;

/**
 * Generate a new ScheduleRunId
 * @since 1.0.0
 */
export const scheduleRunId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return ScheduleRunId.make(Base.buildId("srn", createId));
});

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
  finishedAt: Schema.NullOr(Schema.DateTimeUtc),
}) {}

export const CreateScheduleRun = ScheduleRun.pipe(Schema.pick("scheduleId"));
export type CreateScheduleRun = typeof CreateScheduleRun.Type;

export const UpdateScheduleRun = Schema.partial(ScheduleRun.pipe(Schema.pick("finishedAt")));
export type UpdateScheduleRun = typeof UpdateScheduleRun.Type;

/**
 * Create a new ScheduleRun
 * @since 1.0.0
 */
export const make = Effect.fn(function* (input: CreateScheduleRun) {
  const base = yield* Base.makeBase();

  return ScheduleRun.make({
    id: yield* scheduleRunId(),
    scheduleId: input.scheduleId,
    status: "in_progress",
    finishedAt: null,
    ...base,
  });
});

/**
 * Mark run as successful
 * @since 1.0.0
 */
export const markSuccess = Effect.fn(function* (model: ScheduleRun) {
  const base = yield* Base.updateBase();
  const now = yield* DateTime.now;
  const workflow = yield* Workflow.make(
    ScheduleRunTemplate,
    model.status as Workflow.StateOf<typeof ScheduleRunTemplate>,
  );
  const next = yield* Workflow.transition(workflow, "succeed");

  return ScheduleRun.make({
    ...model,
    status: next.state,
    finishedAt: now,
    ...base,
  });
});

/**
 * Mark run as failed
 * @since 1.0.0
 */
export const markFailure = Effect.fn(function* (model: ScheduleRun) {
  const base = yield* Base.updateBase();
  const now = yield* DateTime.now;
  const workflow = yield* Workflow.make(
    ScheduleRunTemplate,
    model.status as Workflow.StateOf<typeof ScheduleRunTemplate>,
  );
  const next = yield* Workflow.transition(workflow, "fail");

  return ScheduleRun.make({
    ...model,
    status: next.state,
    finishedAt: now,
    ...base,
  });
});

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
