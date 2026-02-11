import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { Actor, Base, Framework } from "@chronops/domain";
import { timestampUtc, timestampUtcNullable } from "../common/db-type";

export const frameworkTable = pgTable(
  "framework",
  {
    // Framework fields
    id: text().notNull().$type<Framework.FrameworkId>().primaryKey(),
    ticket: text().notNull().$type<Base.Ticket>(),
    name: text().notNull(),
    description: text(),
    version: text().$type<Framework.SemVer>(),
    status: text().$type<Framework.WorkflowStatus>().notNull(),

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
  (table) => [uniqueIndex("framework_org_ticket_uidx").on(table.orgId, table.ticket)],
);
