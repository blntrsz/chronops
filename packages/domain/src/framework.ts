import { Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Base from "./base";
import * as Workflow from "./workflow";

export const FrameworkId = Schema.String.pipe(Schema.brand("FrameworkId"));
export type FrameworkId = typeof FrameworkId.Type;

/**
 * Generate a new FrameworkId
 * @since 1.0.0
 */
export const frameworkId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;

  return FrameworkId.make(`fwk_${createId()}`);
});

/**
 * Workflow statuses
 * @since 1.0.0
 */
export const WorkflowStatus = Schema.Union(
  Schema.Literal("draft"),
  Schema.Literal("active"),
  Schema.Literal("archived"),
);
export type WorkflowStatus = typeof WorkflowStatus.Type;

/**
 * Framework model
 * @since 1.0.0
 * @category models
 */
export class Framework extends Base.Base.extend<Framework>("Framework")({
  id: FrameworkId,
  name: Schema.String,
  description: Schema.NullOr(Schema.String),
  version: Schema.NullOr(Schema.Union(Schema.Number, Schema.NumberFromString)),
  status: WorkflowStatus,
}) {}

export const CreateFramework = Framework.pipe(
  Schema.pick("name", "description", "version"),
);
export type CreateFramework = typeof CreateFramework.Type;

export const UpdateFramework = CreateFramework.pipe(Schema.partial);
export type UpdateFramework = typeof UpdateFramework.Type;

/**
 * Workflow template for Framework entity
 * @since 1.0.0
 * @category workflows
 */
export const WorkflowTemplate = {
  entityType: "framework",
  initial: "draft",
  transitions: {
    draft: { ACTIVATE: "active", ARCHIVE: "archived" },
    active: { ARCHIVE: "archived" },
    archived: {},
  },
} as const satisfies Workflow.WorkflowTemplate<typeof WorkflowStatus.Type>;

/**
 * Create a new Framework
 * @since 1.0.0
 */
export const make = Effect.fn(function* (input: CreateFramework) {
  const workflow = yield* Workflow.make(WorkflowTemplate);
  const base = yield* Base.makeBase({ workflowId: workflow.id });

  return Framework.make({
    id: yield* frameworkId(),
    status: workflow.status as WorkflowStatus,
    ...input,
    ...base,
  });
});

/**
 * Update an existing Framework
 * @since 1.0.0
 */
export const update = Effect.fn(function* (
  model: Framework,
  input: UpdateFramework,
) {
  const base = yield* Base.updateBase();

  return Framework.make({
    ...model,
    ...input,
    ...base,
  });
});

/**
 * Remove an existing Framework
 * @since 1.0.0
 */
export const remove = Effect.fn(function* (model: Framework) {
  const base = yield* Base.removeBase();

  return Framework.make({
    ...model,
    ...base,
  });
});

/**
 * Convert Framework model to Workflow model
 * @since 1.0.0
 */
export const toWorkflow = (model: Framework) =>
  Workflow.Workflow.make({
    id: model.workflowId,
    status: model.status,
    transitions: WorkflowTemplate.transitions,
  });

/**
 * Update Framework model from Workflow transition
 * @since 1.0.0
 */
export const fromWorkflowTransition = Effect.fn(function* (
  model: Framework,
  workflow: Workflow.Workflow,
) {
  const base = yield* Base.updateBase();

  return Framework.make({
    ...model,
    ...base,
    status: workflow.status as WorkflowStatus,
  });
});

/**
 * Framework not found error
 * @since 1.0.0
 * @category errors
 */
export class FrameworkNotFoundError extends Base.NotFoundError {
  static override fromId(id: FrameworkId) {
    return new FrameworkNotFoundError({
      message: `Framework with id ${id} not found.`,
      entityType: "Framework",
      entityId: id,
    });
  }
}
