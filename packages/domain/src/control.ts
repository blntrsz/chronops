import { Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Actor from "./actor";
import * as Base from "./base";
import * as Event from "./event";
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

export class CreateControlEvent extends Event.DomainEvent.extend<CreateControlEvent>(
  "CreateControlEvent",
)({
  name: Schema.Literal("control.created"),
  entityType: Schema.Literal("control"),
}) {}

export class UpdateControlEvent extends Event.DomainEvent.extend<UpdateControlEvent>(
  "UpdateControlEvent",
)({
  name: Schema.Literal("control.updated"),
  entityType: Schema.Literal("control"),
}) {}

export class DeleteControlEvent extends Event.DomainEvent.extend<DeleteControlEvent>(
  "DeleteControlEvent",
)({
  name: Schema.Literal("control.deleted"),
  entityType: Schema.Literal("control"),
}) {}

export const makeCreateControlEvent = Effect.fn(function* (
  previous: Control | null,
  next: Control,
) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "control.created",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous?.revisionId ?? null,
    revisionId: next.revisionId,
    entityType: "control",
    entityId: next.id,
  });

  return CreateControlEvent.make({
    ...event,
    name: "control.created",
    entityType: "control",
  });
});

export const makeUpdateControlEvent = Effect.fn(function* (previous: Control, next: Control) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "control.updated",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous.revisionId,
    revisionId: next.revisionId,
    entityType: "control",
    entityId: next.id,
  });

  return UpdateControlEvent.make({
    ...event,
    name: "control.updated",
    entityType: "control",
  });
});

export const makeDeleteControlEvent = Effect.fn(function* (previous: Control, next: Control) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "control.deleted",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous.revisionId,
    revisionId: next.revisionId,
    entityType: "control",
    entityId: next.id,
  });

  return DeleteControlEvent.make({
    ...event,
    name: "control.deleted",
    entityType: "control",
  });
});

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
