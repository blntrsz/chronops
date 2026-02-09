import { Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Actor from "./actor";
import * as Base from "./base";
import * as Control from "./control";
import * as Event from "./event";
import * as Workflow from "./workflow";

export const PolicyId = Schema.String.pipe(Schema.brand("PolicyId"));
export type PolicyId = typeof PolicyId.Type;

export const policyId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return PolicyId.make(Base.buildId("pol", createId));
});

export const PolicyStatus = Schema.Union(
  Schema.Literal("draft"),
  Schema.Literal("active"),
  Schema.Literal("archived"),
);
export type PolicyStatus = typeof PolicyStatus.Type;

export const PolicyReviewFrequency = Schema.Union(
  Schema.Literal("daily"),
  Schema.Literal("weekly"),
  Schema.Literal("monthly"),
  Schema.Literal("quarterly"),
  Schema.Literal("semiannual"),
  Schema.Literal("annual"),
);
export type PolicyReviewFrequency = typeof PolicyReviewFrequency.Type;

export class Policy extends Base.Base.extend<Policy>("Policy")({
  id: PolicyId,
  title: Schema.String,
  description: Schema.NullOr(Schema.String),
  status: PolicyStatus,
  version: Schema.NullOr(Schema.String),
  effectiveAt: Schema.NullOr(Schema.DateTimeUtc),
  reviewDueAt: Schema.NullOr(Schema.DateTimeUtc),
  reviewFrequency: Schema.NullOr(PolicyReviewFrequency),
  ownerId: Schema.NullOr(Actor.MemberId),
  controlId: Schema.NullOr(Control.ControlId),
}) {}

export const CreatePolicy = Policy.pipe(
  Schema.pick(
    "title",
    "description",
    "version",
    "effectiveAt",
    "reviewDueAt",
    "reviewFrequency",
    "ownerId",
    "controlId",
  ),
);
export type CreatePolicy = typeof CreatePolicy.Type;

export const UpdatePolicy = Policy.pipe(
  Schema.pick(
    "title",
    "description",
    "status",
    "version",
    "effectiveAt",
    "reviewDueAt",
    "reviewFrequency",
    "ownerId",
    "controlId",
  ),
  Schema.partial,
);
export type UpdatePolicy = typeof UpdatePolicy.Type;

export const PolicyTemplate = Workflow.WorkflowTemplate.make({
  initial: "draft",
  transitions: {
    draft: { activate: "active", archive: "archived" },
    active: { archive: "archived" },
    archived: {},
  },
});

export type PolicyEvent = Workflow.EventOf<typeof PolicyTemplate>;

export class CreatePolicyEvent extends Event.DomainEvent.extend<CreatePolicyEvent>(
  "CreatePolicyEvent",
)({
  name: Schema.Literal("policy.created"),
  entityType: Schema.Literal("policy"),
}) {}

export class UpdatePolicyEvent extends Event.DomainEvent.extend<UpdatePolicyEvent>(
  "UpdatePolicyEvent",
)({
  name: Schema.Literal("policy.updated"),
  entityType: Schema.Literal("policy"),
}) {}

export class DeletePolicyEvent extends Event.DomainEvent.extend<DeletePolicyEvent>(
  "DeletePolicyEvent",
)({
  name: Schema.Literal("policy.deleted"),
  entityType: Schema.Literal("policy"),
}) {}

export const makeCreatePolicyEvent = Effect.fn(function* (previous: Policy | null, next: Policy) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "policy.created",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous?.revisionId ?? null,
    revisionId: next.revisionId,
    entityType: "policy",
    entityId: next.id,
  });

  return CreatePolicyEvent.make({
    ...event,
    name: "policy.created",
    entityType: "policy",
  });
});

export const makeUpdatePolicyEvent = Effect.fn(function* (previous: Policy, next: Policy) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "policy.updated",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous.revisionId,
    revisionId: next.revisionId,
    entityType: "policy",
    entityId: next.id,
  });

  return UpdatePolicyEvent.make({
    ...event,
    name: "policy.updated",
    entityType: "policy",
  });
});

export const makeDeletePolicyEvent = Effect.fn(function* (previous: Policy, next: Policy) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "policy.deleted",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous.revisionId,
    revisionId: next.revisionId,
    entityType: "policy",
    entityId: next.id,
  });

  return DeletePolicyEvent.make({
    ...event,
    name: "policy.deleted",
    entityType: "policy",
  });
});

export const make = Effect.fn(function* (input: CreatePolicy) {
  const base = yield* Base.makeBase();

  return Policy.make({
    id: yield* policyId(),
    status: "draft",
    ...input,
    ...base,
  });
});

export const update = Effect.fn(function* (model: Policy, input: UpdatePolicy) {
  const base = yield* Base.updateBase();

  return Policy.make({
    ...model,
    ...input,
    ...base,
  });
});

export const remove = Effect.fn(function* (model: Policy) {
  const base = yield* Base.removeBase();

  return Policy.make({
    ...model,
    ...base,
  });
});

export class PolicyNotFoundError extends Base.NotFoundError {
  static override fromId(id: PolicyId) {
    return new PolicyNotFoundError({
      message: `Policy with id ${id} not found.`,
      entityType: "Policy",
      entityId: id,
    });
  }
}
