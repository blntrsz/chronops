import { Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Base from "./base";
import { FrameworkId } from "./framework";
import * as Workflow from "./workflow";

export const ControlId = Schema.String.pipe(Schema.brand("ControlId"));
export type ControlId = typeof ControlId.Type;

/**
 * Generate a new ControlId
 * @since 1.0.0
 */
export const controlId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;

  return ControlId.make(`ctr_${createId()}`);
});

/**
 * Workflow statuses
 * @since 1.0.0
 */
export const ControlStatus = Schema.Union(
  Schema.Literal("draft"),
  Schema.Literal("under_review"),
  Schema.Literal("approved"),
  Schema.Literal("deprecated"),
);
export type ControlStatus = typeof ControlStatus.Type;

/**
 * Control model
 * @since 1.0.0
 * @category models
 */
export class Control extends Base.Base.extend<Control>("Control")({
  id: ControlId,
  name: Schema.String,
  description: Schema.NullOr(Schema.String),
  frameworkId: FrameworkId,
  status: ControlStatus,
  testingFrequency: Schema.NullOr(Schema.String),
}) {}

export const CreateControl = Control.pipe(
  Schema.pick("name", "description", "frameworkId", "testingFrequency"),
);
export type CreateControl = typeof CreateControl.Type;

export const UpdateControl = CreateControl.pipe(Schema.partial);
export type UpdateControl = typeof UpdateControl.Type;

/**
 * Workflow template for Control entity
 * @since 1.0.0
 * @category workflows
 */
export const WorkflowTemplate = {
  entityType: "control",
  initial: "draft",
  transitions: {
    draft: { SUBMIT: "under_review" },
    under_review: { APPROVE: "approved", REJECT: "draft" },
    approved: { DEPRECATE: "deprecated" },
    deprecated: {},
  },
} as const satisfies Workflow.WorkflowTemplate<typeof ControlStatus.Type>;

/**
 * Create a new Control
 * @since 1.0.0
 */
export const make = Effect.fn(function* (input: CreateControl) {
  const workflow = yield* Workflow.make(WorkflowTemplate);
  const base = yield* Base.makeBase({ workflowId: workflow.id });

  return Control.make({
    id: yield* controlId(),
    status: workflow.status as ControlStatus,
    ...input,
    ...base,
  });
});

/**
 * Update an existing Control
 * @since 1.0.0
 */
export const update = Effect.fn(function* (
  model: Control,
  input: UpdateControl,
) {
  const base = yield* Base.updateBase();

  return Control.make({
    ...model,
    ...input,
    ...base,
  });
});

/**
 * Remove an existing Control
 * @since 1.0.0
 */
export const remove = Effect.fn(function* (model: Control) {
  const base = yield* Base.removeBase();

  return Control.make({
    ...model,
    ...base,
  });
});

/**
 * Convert Control model to Workflow model
 * @since 1.0.0
 */
export const toWorkflow = (model: Control) =>
  Workflow.Workflow.make({
    id: model.workflowId,
    status: model.status,
    transitions: WorkflowTemplate.transitions,
  });

/**
 * Update Control model from Workflow transition
 * @since 1.0.0
 */
export const fromWorkflowTransition = Effect.fn(function* (
  model: Control,
  workflow: Workflow.Workflow,
) {
  const base = yield* Base.updateBase();

  return Control.make({
    ...model,
    ...base,
    status: workflow.status as ControlStatus,
  });
});

/**
 * Control not found error
 * @since 1.0.0
 * @category errors
 */
export class ControlNotFoundError extends Base.NotFoundError {
  static override fromId(id: ControlId) {
    return new ControlNotFoundError({
      message: `Control with id ${id} not found.`,
      entityType: "Control",
      entityId: id,
    });
  }
}
