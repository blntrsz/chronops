import { pgTable, text } from "drizzle-orm/pg-core";
import { Actor, AssessmentTemplate, Base, Control } from "@chronops/domain";
import { timestampUtc, timestampUtcNullable } from "../common/db-type";

export const assessmentTemplateTable = pgTable("assessment_template", {
  id: text()
    .notNull()
    .$type<AssessmentTemplate.AssessmentTemplateId>()
    .primaryKey(),
  controlId: text().notNull().$type<Control.ControlId>(),
  name: text().notNull(),
  description: text(),
  status: text().$type<AssessmentTemplate.AssessmentWorkflowStatus>().notNull(),

  createdAt: timestampUtc({ withTimezone: true }).notNull(),
  updatedAt: timestampUtc({ withTimezone: true }).notNull(),
  deletedAt: timestampUtcNullable({ withTimezone: true }),

  createdBy: text().$type<Actor.MemberId>().notNull(),
  updatedBy: text().$type<Actor.MemberId>().notNull(),
  deletedBy: text().$type<Actor.MemberId>(),

  revisionId: text().$type<Base.RevisionId>().notNull(),
  orgId: text().$type<Actor.OrgId>().notNull(),
});
