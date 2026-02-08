import { relations } from "drizzle-orm";
import { index, pgTable, text } from "drizzle-orm/pg-core";
import { Actor, Base, Event } from "@chronops/domain";
import { timestampUtc } from "../common/db-type";

export const eventTable = pgTable(
  "event",
  {
    id: text().notNull().$type<Event.EventId>().primaryKey(),
    name: text().notNull(),
    actorId: text().notNull().$type<Actor.MemberId>(),
    orgId: text().notNull().$type<Actor.OrgId>(),
    typeStamp: timestampUtc({ withTimezone: true }).notNull(),
    revisionIdBefore: text().$type<Base.RevisionId>(),
    revisionId: text().notNull().$type<Base.RevisionId>(),
    entityType: text().notNull(),
    entityId: text().notNull(),
  },
  (table) => [
    index("event_org_id_idx").on(table.orgId),
    index("event_type_stamp_idx").on(table.typeStamp),
    index("event_actor_id_idx").on(table.actorId),
    index("event_entity_idx").on(table.entityType, table.entityId),
  ],
);
export const eventRelations = relations(eventTable, () => ({}));
