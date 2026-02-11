import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { Actor, Base, Control, Framework } from "@chronops/domain";

import { timestampUtc, timestampUtcNullable } from "../common/db-type";

export const controlTable = pgTable(
  "control",
  {
    // Control fields
    id: text().notNull().$type<Control.ControlId>().primaryKey(),
    ticket: text().notNull().$type<Base.Ticket>(),
    name: text().notNull(),
    description: text(),
    frameworkId: text().notNull().$type<Framework.FrameworkId>(),
    status: text().$type<Control.ControlStatus>().notNull(),
    testingFrequency: text().$type<Control.ControlTestingFrequency>(),

    // Base fields
    createdAt: timestampUtc({ withTimezone: true }).notNull(),
    updatedAt: timestampUtc({ withTimezone: true }).notNull(),
    deletedAt: timestampUtcNullable({ withTimezone: true }),

    createdBy: text().$type<Actor.MemberId>().notNull(),
    updatedBy: text().$type<Actor.MemberId>().notNull(),
    deletedBy: text().$type<Actor.MemberId>(),

    revisionId: text().$type<Base.RevisionId>().notNull(),
    orgId: text().$type<Actor.OrgId>().notNull(),
  },
  (table) => [uniqueIndex("control_org_ticket_uidx").on(table.orgId, table.ticket)],
);
