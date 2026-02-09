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

  return ControlId.make(Base.buildId("ctr", createId));
});

/**
 * Workflow statuses
 * @since 1.0.0
 */
export const ControlStatus = Schema.Union(
  Schema.Literal("draft"),
  Schema.Literal("active"),
  Schema.Literal("archived"),
);
export type ControlStatus = typeof ControlStatus.Type;

export const ControlTestingFrequency = Schema.Union(
  Schema.Literal("daily"),
  Schema.Literal("weekly"),
  Schema.Literal("monthly"),
  Schema.Literal("quarterly"),
  Schema.Literal("semiannual"),
  Schema.Literal("annual"),
);
export type ControlTestingFrequency = typeof ControlTestingFrequency.Type;

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
  testingFrequency: Schema.NullOr(ControlTestingFrequency),
}) {}

export const Event = {
  created: "control.created",
  updated: "control.updated",
  deleted: "control.deleted",
} as const;

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
export const ControlTemplate = Workflow.WorkflowTemplate.make({
  initial: "draft",
  transitions: {
    draft: { activate: "active", archive: "archived" },
    active: { archive: "archived" },
    archived: {},
  },
});

export type ControlEvent = Workflow.EventOf<typeof ControlTemplate>;

/**
 * Create a new Control
 * @since 1.0.0
 */
export const make = Effect.fn(function* (input: CreateControl) {
  const base = yield* Base.makeBase();

  return Control.make({
    id: yield* controlId(),
    status: "draft",
    ...input,
    ...base,
  });
});

/**
 * Update an existing Control
 * @since 1.0.0
 */
export const update = Effect.fn(function* (model: Control, input: UpdateControl) {
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
