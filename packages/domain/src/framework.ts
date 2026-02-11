import { Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Base from "./base";
import * as Workflow from "./workflow";

export const FrameworkId = Schema.String.pipe(Schema.brand("FrameworkId"));
export type FrameworkId = typeof FrameworkId.Type;

export const SemVer = Schema.String.pipe(Schema.brand("SemVer"));
export type SemVer = typeof SemVer.Type;

/**
 * Generate a new FrameworkId
 * @since 1.0.0
 */
export const frameworkId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;

  return FrameworkId.make(Base.buildId("fwk", createId));
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
  ticket: Base.Ticket,
  name: Schema.String,
  description: Schema.NullOr(Schema.String),
  version: Schema.NullOr(SemVer),
  status: WorkflowStatus,
}) {}

export const Event = {
  created: "framework.created",
  updated: "framework.updated",
  deleted: "framework.deleted",
} as const;

export const CreateFramework = Framework.pipe(Schema.pick("name", "description", "version"));
export type CreateFramework = typeof CreateFramework.Type;

export type CreateFrameworkInput = CreateFramework & { ticket: Base.Ticket };

export const UpdateFramework = CreateFramework.pipe(Schema.partial);
export type UpdateFramework = typeof UpdateFramework.Type;

/**
 * Workflow template for Framework entity
 * @since 1.0.0
 * @category workflows
 */
export const FrameworkTemplate = Workflow.WorkflowTemplate.make({
  initial: "draft",
  transitions: {
    draft: { activate: "active", archive: "archived" },
    active: { archive: "archived" },
    archived: {},
  },
});

export type WorkflowEvent = Workflow.EventOf<typeof FrameworkTemplate>;

/**
 * Create a new Framework
 * @since 1.0.0
 */
export const make = Effect.fn(function* (input: CreateFrameworkInput) {
  const base = yield* Base.makeBase();

  return Framework.make({
    id: yield* frameworkId(),
    status: "draft",
    ...input,
    ...base,
  });
});

/**
 * Update an existing Framework
 * @since 1.0.0
 */
export const update = Effect.fn(function* (model: Framework, input: UpdateFramework) {
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
