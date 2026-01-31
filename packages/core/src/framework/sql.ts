import { pgTable, text, integer } from "drizzle-orm/pg-core";
import { Actor, Base, Framework } from "@chronops/domain";
import { timestampUtc, timestampUtcNullable } from "../common/db-type";

export const frameworkTable = pgTable("framework", {
  // Framework fields
  id: text().notNull().$type<Framework.FrameworkId>().primaryKey(),
  name: text().notNull(),
  description: text(),
  version: integer(),
  status: text().$type<Framework.WorkflowStatus>().notNull(),

  // Base fields
  createdAt: timestampUtc({ withTimezone: true }).notNull(),
  updatedAt: timestampUtc({ withTimezone: true }).notNull(),
  deletedAt: timestampUtcNullable({ withTimezone: true }),

  createdBy: text().$type<Actor.MemberId>().notNull(),
  updatedBy: text().$type<Actor.MemberId>().notNull(),
  deletedBy: text().$type<Actor.MemberId>(),

  hash: text().$type<Base.Hash>().notNull(),
  orgId: text().$type<Actor.OrgId>().notNull(),
});
