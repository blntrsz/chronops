import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { Actor, Base, Control, Risk } from "@chronops/domain";
import { timestampUtc, timestampUtcNullable } from "../common/db-type";

export const riskTable = pgTable("risk", {
  id: text().notNull().$type<Risk.RiskId>().primaryKey(),
  title: text().notNull(),
  description: text(),
  status: text().$type<Risk.RiskStatus>().notNull(),
  likelihood: text().$type<Risk.RiskLikelihood>().notNull(),
  impact: text().$type<Risk.RiskImpact>().notNull(),
  score: integer().$type<Risk.RiskScore>(),
  treatment: text().$type<Risk.RiskTreatment>(),
  controlId: text().$type<Control.ControlId>(),

  createdAt: timestampUtc({ withTimezone: true }).notNull(),
  updatedAt: timestampUtc({ withTimezone: true }).notNull(),
  deletedAt: timestampUtcNullable({ withTimezone: true }),

  createdBy: text().$type<Actor.MemberId>().notNull(),
  updatedBy: text().$type<Actor.MemberId>().notNull(),
  deletedBy: text().$type<Actor.MemberId>(),

  revisionId: text().$type<Base.RevisionId>().notNull(),
  orgId: text().$type<Actor.OrgId>().notNull(),
});
