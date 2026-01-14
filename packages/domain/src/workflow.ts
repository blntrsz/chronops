import { Effect } from "effect";
import * as Schema from "effect/Schema";

import * as Base from "./base";

export const WorkflowId = Base.WorkflowId;
export type WorkflowId = typeof WorkflowId.Type;

/**
 * Generate a new WorkflowId
 * @since 1.0.0
 */
export const workflowId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;

  return WorkflowId.make(`wfl_${createId()}`);
});

/**
 * Workflow model
 * @since 1.0.0
 * @category models
 */
export class Workflow extends Schema.Class<Workflow>("Workflow")({
  id: WorkflowId,
  status: Schema.String,
  transitions: Schema.Record({
    key: Schema.String,
    value: Schema.Record({
      key: Schema.String,
      value: Schema.String,
    }),
  }),
}) {}

/**
 * Workflow entity types
 * @since 1.0.0
 */
export type WorkflowTemplate<T extends string = string> = {
  entityType: string;
  initial: T;
  transitions: {
    [K in T]: {
      [event: string]: T;
    };
  };
};

/**
 * Create a new Workflow
 * @since 1.0.0
 */
export const make = Effect.fn(function* <T extends string>(
  input: WorkflowTemplate<T>,
) {
  const id = yield* workflowId();

  return Workflow.make({
    id,
    status: input.initial,
    ...input,
  });
});

/**
 * Transition the workflow to the next status based on the event
 */
export const transition = Effect.fn(function* (
  workflow: Workflow,
  event: string,
) {
  const next = workflow.transitions[workflow.status]?.[event];

  if (!next) {
    return yield* WorkflowInvalidTransitionError.make({
      message: `Invalid transition from ${workflow.status} with event ${event}`,
    });
  }

  return Workflow.make({
    ...workflow,
    status: next,
  });
});

/**
 * Workflow not found error
 * @since 1.0.0
 * @category errors
 */
export class WorkflowNotFoundError extends Schema.TaggedError<WorkflowNotFoundError>(
  "WorkflowNotFoundError",
)("WorkflowNotFoundError", {
  message: Schema.String,
}) {
  static fromId(id: WorkflowId) {
    return new WorkflowNotFoundError({
      message: `Workflow with id ${id} not found`,
    });
  }
}

/**
 * Workflow invalid transition error
 * @since 1.0.0
 * @category errors
 */
export class WorkflowInvalidTransitionError extends Schema.TaggedError<WorkflowInvalidTransitionError>(
  "WorkflowInvalidTransitionError",
)("WorkflowInvalidTransitionError", {
  message: Schema.String,
}) {}
