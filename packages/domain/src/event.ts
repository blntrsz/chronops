import { DateTime, Effect, Schema } from "effect";
import * as Actor from "./actor";
import * as Base from "./base";

export const EventId = Schema.String.pipe(Schema.brand("EventId"));
export type EventId = typeof EventId.Type;

export class DomainEvent extends Schema.Class<DomainEvent>("DomainEvent")({
  id: EventId,
  name: Schema.String,
  actorId: Actor.MemberId,
  orgId: Actor.OrgId,
  typeStamp: Schema.DateTimeUtc,
  revisionIdBefore: Schema.NullOr(Base.RevisionId),
  revisionId: Base.RevisionId,
  entityType: Schema.String,
  entityId: Schema.String,
}) {}

export const eventId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return EventId.make(Base.buildId("evt", createId));
});

export const makeEvent = Effect.fn(function* (input: {
  name: string;
  actorId: Actor.MemberId;
  orgId: Actor.OrgId;
  revisionIdBefore: Base.RevisionId | null;
  revisionId: Base.RevisionId;
  entityType: string;
  entityId: string;
}) {
  const now = yield* DateTime.now;

  return DomainEvent.make({
    id: yield* eventId(),
    typeStamp: now,
    ...input,
  });
});
