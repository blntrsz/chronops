import { Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Actor from "./actor";
import * as Base from "./base";
import * as Control from "./control";
import * as Event from "./event";
import * as Pdf from "./pdf";
import * as Workflow from "./workflow";

export const EvidenceId = Schema.String.pipe(Schema.brand("EvidenceId"));
export type EvidenceId = typeof EvidenceId.Type;

export const evidenceId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return EvidenceId.make(Base.buildId("evd", createId));
});

export const EvidenceStatus = Schema.Union(
  Schema.Literal("draft"),
  Schema.Literal("active"),
  Schema.Literal("archived"),
);
export type EvidenceStatus = typeof EvidenceStatus.Type;

export const EvidenceSourceType = Schema.Union(Schema.Literal("upload"), Schema.Literal("link"));
export type EvidenceSourceType = typeof EvidenceSourceType.Type;

export const EvidenceRetentionDays = Schema.Number.pipe(
  Schema.int(),
  Schema.greaterThanOrEqualTo(0),
);
export type EvidenceRetentionDays = typeof EvidenceRetentionDays.Type;

export class Evidence extends Base.Base.extend<Evidence>("Evidence")({
  id: EvidenceId,
  title: Schema.String,
  description: Schema.NullOr(Schema.String),
  controlId: Schema.NullOr(Control.ControlId),
  sourceType: EvidenceSourceType,
  pdfId: Schema.NullOr(Pdf.PdfId),
  linkUrl: Schema.NullOr(Schema.String),
  collectedAt: Schema.NullOr(Schema.DateTimeUtc),
  retentionDays: Schema.NullOr(EvidenceRetentionDays),
  retentionEndsAt: Schema.NullOr(Schema.DateTimeUtc),
  status: EvidenceStatus,
}) {}

export const CreateEvidence = Evidence.pipe(
  Schema.pick(
    "title",
    "description",
    "controlId",
    "sourceType",
    "pdfId",
    "linkUrl",
    "collectedAt",
    "retentionDays",
    "retentionEndsAt",
  ),
);
export type CreateEvidence = typeof CreateEvidence.Type;

export const UpdateEvidence = Evidence.pipe(
  Schema.pick(
    "title",
    "description",
    "controlId",
    "sourceType",
    "pdfId",
    "linkUrl",
    "collectedAt",
    "retentionDays",
    "retentionEndsAt",
    "status",
  ),
  Schema.partial,
);
export type UpdateEvidence = typeof UpdateEvidence.Type;

export const EvidenceTemplate = Workflow.WorkflowTemplate.make({
  initial: "draft",
  transitions: {
    draft: { activate: "active", archive: "archived" },
    active: { archive: "archived" },
    archived: {},
  },
});

export type EvidenceEvent = Workflow.EventOf<typeof EvidenceTemplate>;

export class CreateEvidenceEvent extends Event.DomainEvent.extend<CreateEvidenceEvent>(
  "CreateEvidenceEvent",
)({
  name: Schema.Literal("evidence.created"),
  entityType: Schema.Literal("evidence"),
}) {}

export class UpdateEvidenceEvent extends Event.DomainEvent.extend<UpdateEvidenceEvent>(
  "UpdateEvidenceEvent",
)({
  name: Schema.Literal("evidence.updated"),
  entityType: Schema.Literal("evidence"),
}) {}

export class DeleteEvidenceEvent extends Event.DomainEvent.extend<DeleteEvidenceEvent>(
  "DeleteEvidenceEvent",
)({
  name: Schema.Literal("evidence.deleted"),
  entityType: Schema.Literal("evidence"),
}) {}

export const makeCreateEvidenceEvent = Effect.fn(function* (
  previous: Evidence | null,
  next: Evidence,
) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "evidence.created",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous?.revisionId ?? null,
    revisionId: next.revisionId,
    entityType: "evidence",
    entityId: next.id,
  });

  return CreateEvidenceEvent.make({
    ...event,
    name: "evidence.created",
    entityType: "evidence",
  });
});

export const makeUpdateEvidenceEvent = Effect.fn(function* (previous: Evidence, next: Evidence) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "evidence.updated",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous.revisionId,
    revisionId: next.revisionId,
    entityType: "evidence",
    entityId: next.id,
  });

  return UpdateEvidenceEvent.make({
    ...event,
    name: "evidence.updated",
    entityType: "evidence",
  });
});

export const makeDeleteEvidenceEvent = Effect.fn(function* (previous: Evidence, next: Evidence) {
  const actor = yield* Actor.Actor;
  const event = yield* Event.makeEvent({
    name: "evidence.deleted",
    actorId: actor.memberId,
    orgId: actor.orgId,
    revisionIdBefore: previous.revisionId,
    revisionId: next.revisionId,
    entityType: "evidence",
    entityId: next.id,
  });

  return DeleteEvidenceEvent.make({
    ...event,
    name: "evidence.deleted",
    entityType: "evidence",
  });
});

export const make = Effect.fn(function* (input: CreateEvidence) {
  const base = yield* Base.makeBase();

  return Evidence.make({
    id: yield* evidenceId(),
    status: "draft",
    ...input,
    ...base,
  });
});

export const update = Effect.fn(function* (model: Evidence, input: UpdateEvidence) {
  const base = yield* Base.updateBase();

  return Evidence.make({
    ...model,
    ...input,
    ...base,
  });
});

export const remove = Effect.fn(function* (model: Evidence) {
  const base = yield* Base.removeBase();

  return Evidence.make({
    ...model,
    ...base,
  });
});

export class EvidenceNotFoundError extends Base.NotFoundError {
  static override fromId(id: EvidenceId) {
    return new EvidenceNotFoundError({
      message: `Evidence with id ${id} not found.`,
      entityType: "Evidence",
      entityId: id,
    });
  }
}
