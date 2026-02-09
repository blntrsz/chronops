import { Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Actor from "./actor";
import * as Base from "./base";
import * as Event from "./event";
import * as Workflow from "./workflow";

export const FrameworkId = Schema.String.pipe(Schema.brand("FrameworkId"));
export type FrameworkId = typeof FrameworkId.Type;

export const SemVer = Schema.String.pipe(
  Schema.pattern(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/),
  Schema.brand("SemVer"),
);
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
  name: Schema.String,
  description: Schema.NullOr(Schema.String),
  version: Schema.NullOr(SemVer),
  status: WorkflowStatus,
}) {}

export const CreateFramework = Framework.pipe(Schema.pick("name", "description", "version"));
export type CreateFramework = typeof CreateFramework.Type;

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

export class CreateFrameworkEvent extends Event.DomainEvent.extend<CreateFrameworkEvent>(
  "CreateFrameworkEvent",
)({
  name: Schema.Literal("framework.created"),
  entityType: Schema.Literal("framework"),
}) {}

export class UpdateFrameworkEvent extends Event.DomainEvent.extend<UpdateFrameworkEvent>(
  "UpdateFrameworkEvent",
)({
  name: Schema.Literal("framework.updated"),
  entityType: Schema.Literal("framework"),
}) {}

export class DeleteFrameworkEvent extends Event.DomainEvent.extend<DeleteFrameworkEvent>(
  "DeleteFrameworkEvent",
)({
  name: Schema.Literal("framework.deleted"),
  entityType: Schema.Literal("framework"),
}) {}

export const makeCreateFrameworkEvent = Effect.fn(function* (
  previous: Framework | null,
  next: Framework,
) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "framework.created",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous?.revisionId ?? null,
    revisionId: next.revisionId,
    entityType: "framework",
    entityId: next.id,
  });

  return CreateFrameworkEvent.make({
    ...event,
    name: "framework.created",
    entityType: "framework",
  });
});

export const makeUpdateFrameworkEvent = Effect.fn(function* (previous: Framework, next: Framework) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "framework.updated",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous.revisionId,
    revisionId: next.revisionId,
    entityType: "framework",
    entityId: next.id,
  });

  return UpdateFrameworkEvent.make({
    ...event,
    name: "framework.updated",
    entityType: "framework",
  });
});

export const makeDeleteFrameworkEvent = Effect.fn(function* (previous: Framework, next: Framework) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "framework.deleted",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous.revisionId,
    revisionId: next.revisionId,
    entityType: "framework",
    entityId: next.id,
  });

  return DeleteFrameworkEvent.make({
    ...event,
    name: "framework.deleted",
    entityType: "framework",
  });
});

/**
 * Create a new Framework
 * @since 1.0.0
 */
export const make = Effect.fn(function* (input: CreateFramework) {
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
