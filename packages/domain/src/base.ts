import { Context, DateTime, Effect, Schema } from "effect";
import { ulid } from "ulid";
import { Actor } from "./actor";

export const MemberId = Schema.String.pipe(Schema.brand("MemberId"));
export type MemberId = typeof MemberId.Type;

export const OrgId = Schema.String.pipe(Schema.brand("OrgId"));
export type OrgId = typeof OrgId.Type;

export const WorkflowId = Schema.String.pipe(Schema.brand("WorkflowId"));
export type WorkflowId = typeof WorkflowId.Type;

export const Hash = Schema.String.pipe(Schema.brand("Hash"));
export type Hash = typeof Hash.Type;

export class Base extends Schema.Class<Base>("BaseSchema")({
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
  deletedAt: Schema.optional(Schema.Date),

  createdBy: MemberId,
  updatedBy: MemberId,
  deletedBy: Schema.optional(MemberId),

  hash: Hash,
  orgId: OrgId,
  workflowId: WorkflowId,
}) {}

export class ULID extends Context.Tag("ULID")<
  ULID,
  {
    createId: () => string;
  }
>() {}

export const ULIDLayer = ULID.of({
  createId: ulid,
});

export const make = Effect.fn(function* ({
  workflowId,
}: {
  workflowId: WorkflowId;
}) {
  const ulid = yield* ULID;
  const now = yield* DateTime.nowAsDate;
  const actor = yield* Actor;

  return Base.make({
    createdAt: now,
    updatedAt: now,
    deletedAt: undefined,
    createdBy: actor.memberId,
    updatedBy: actor.memberId,
    deletedBy: undefined,
    hash: Hash.make(ulid.createId()),
    orgId: actor.orgId,
    workflowId,
  });
});

export const update = Effect.fn(function* () {
  const ulid = yield* ULID;
  const now = yield* DateTime.nowAsDate;
  const actor = yield* Actor;

  return {
    updatedAt: now,
    updatedBy: actor.memberId,
    hash: Hash.make(ulid.createId()),
  };
});

export const remove = Effect.fn(function* () {
  const ulid = yield* ULID;
  const now = yield* DateTime.nowAsDate;
  const actor = yield* Actor;

  return {
    deletedAt: now,
    deletedBy: actor.memberId,
    hash: Hash.make(ulid.createId()),
  };
});
