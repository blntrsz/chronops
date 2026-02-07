import { pgTable, text } from "drizzle-orm/pg-core";
import { Actor, AssessmentInstance, Base, Control, Evidence, Issue } from "@chronops/domain";
import { timestampUtc, timestampUtcNullable } from "../common/db-type";

export const issueTable = pgTable("issue", {
  id: text().notNull().$type<Issue.IssueId>().primaryKey(),
  title: text().notNull(),
  description: text(),
  type: text().$type<Issue.IssueType>().notNull(),
  status: text().$type<Issue.IssueStatus>().notNull(),
  severity: text().$type<Issue.IssueSeverity>(),
  controlId: text().notNull().$type<Control.ControlId>(),
  assessmentInstanceId: text().$type<AssessmentInstance.AssessmentInstanceId>(),
  evidenceId: text().$type<Evidence.EvidenceId>(),
  dueAt: timestampUtcNullable({ withTimezone: true }),
  resolvedAt: timestampUtcNullable({ withTimezone: true }),

  createdAt: timestampUtc({ withTimezone: true }).notNull(),
  updatedAt: timestampUtc({ withTimezone: true }).notNull(),
  deletedAt: timestampUtcNullable({ withTimezone: true }),

  createdBy: text().$type<Actor.MemberId>().notNull(),
  updatedBy: text().$type<Actor.MemberId>().notNull(),
  deletedBy: text().$type<Actor.MemberId>(),

  revisionId: text().$type<Base.RevisionId>().notNull(),
  orgId: text().$type<Actor.OrgId>().notNull(),
});
