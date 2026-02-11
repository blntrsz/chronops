import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { Actor, Base, Control, Policy } from "@chronops/domain";
import { timestampUtc, timestampUtcNullable } from "../common/db-type";

export const policyTable = pgTable(
  "policy",
  {
    id: text().notNull().$type<Policy.PolicyId>().primaryKey(),
    ticket: text().notNull().$type<Base.Ticket>(),
    title: text().notNull(),
    description: text(),
    status: text().$type<Policy.PolicyStatus>().notNull(),
    version: text(),
    effectiveAt: timestampUtcNullable({ withTimezone: true }),
    reviewDueAt: timestampUtcNullable({ withTimezone: true }),
    reviewFrequency: text().$type<Policy.PolicyReviewFrequency>(),
    ownerId: text().$type<Actor.MemberId>(),
    controlId: text().$type<Control.ControlId>(),

    createdAt: timestampUtc({ withTimezone: true }).notNull(),
    updatedAt: timestampUtc({ withTimezone: true }).notNull(),
    deletedAt: timestampUtcNullable({ withTimezone: true }),

    createdBy: text().$type<Actor.MemberId>().notNull(),
    updatedBy: text().$type<Actor.MemberId>().notNull(),
    deletedBy: text().$type<Actor.MemberId>(),

    revisionId: text().$type<Base.RevisionId>().notNull(),
    orgId: text().$type<Actor.OrgId>().notNull(),
  },
  (table) => [uniqueIndex("policy_org_ticket_uidx").on(table.orgId, table.ticket)],
);
