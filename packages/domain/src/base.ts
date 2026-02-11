import { Context, DateTime, Effect, Schema } from "effect";
import { ulid } from "ulid";
import * as Actor from "./actor";

export const RevisionId = Schema.String.pipe(Schema.brand("RevisionId"));
export type RevisionId = typeof RevisionId.Type;

export const TicketPrefix = Schema.String.pipe(
  Schema.pattern(/^[A-Z]{2,3}$/),
  Schema.brand("TicketPrefix"),
);
export type TicketPrefix = typeof TicketPrefix.Type;

export const Ticket = Schema.String.pipe(
  Schema.pattern(/^[A-Z]{2,3}-\d+$/),
  Schema.brand("Ticket"),
);
export type Ticket = typeof Ticket.Type;

export class Base extends Schema.Class<Base>("BaseSchema")({
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc,
  deletedAt: Schema.NullOr(Schema.DateTimeUtc),

  createdBy: Actor.MemberId,
  updatedBy: Actor.MemberId,
  deletedBy: Schema.NullOr(Actor.MemberId),

  revisionId: RevisionId,
  orgId: Actor.OrgId,
}) {}

export const buildId = (prefix: string, createId: () => string) => `${prefix}_${createId()}`;

export class ULID extends Context.Tag("ULID")<
  ULID,
  {
    createId: () => string;
  }
>() {}

export const ULIDLayer = ULID.of({
  createId: ulid,
});

export class NotFoundError extends Schema.TaggedError<NotFoundError>("NotFoundError")(
  "NotFoundError",
  {
    message: Schema.String,
    entityType: Schema.String,
    entityId: Schema.optional(Schema.String),
  },
) {
  static fromId(entityType: string, id: string) {
    return new NotFoundError({
      message: `${entityType} with id ${id} not found.`,
      entityType,
      entityId: id,
    });
  }

  static fromType(entityType: string) {
    return new NotFoundError({
      message: `${entityType} not found.`,
      entityType,
    });
  }
}

export const makeBase = Effect.fn(function* () {
  const ulid = yield* ULID;
  const now = yield* DateTime.now;
  const actor = yield* Actor.Actor;

  return Base.make({
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    createdBy: actor.memberId,
    updatedBy: actor.memberId,
    deletedBy: null,
    revisionId: RevisionId.make(ulid.createId()),
    orgId: actor.orgId,
  });
});

export const updateBase = Effect.fn(function* () {
  const ulid = yield* ULID;
  const now = yield* DateTime.now;
  const actor = yield* Actor.Actor;

  return {
    updatedAt: now,
    updatedBy: actor.memberId,
    revisionId: RevisionId.make(ulid.createId()),
  };
});

export const removeBase = Effect.fn(function* () {
  const ulid = yield* ULID;
  const now = yield* DateTime.now;
  const actor = yield* Actor.Actor;

  return {
    deletedAt: now,
    deletedBy: actor.memberId,
    revisionId: RevisionId.make(ulid.createId()),
  };
});
