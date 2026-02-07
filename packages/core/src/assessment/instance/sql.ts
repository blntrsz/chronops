import { pgTable, text } from "drizzle-orm/pg-core";
import { Actor, AssessmentInstance, AssessmentTemplate, Base, Control } from "@chronops/domain";
import { timestampUtc, timestampUtcNullable } from "../../common/db-type";

export const assessmentInstanceTable = pgTable("assessment_instance", {
  id: text().notNull().$type<AssessmentInstance.AssessmentInstanceId>().primaryKey(),
  templateId: text().notNull().$type<AssessmentTemplate.AssessmentTemplateId>(),
  controlId: text().notNull().$type<Control.ControlId>(),
  name: text().notNull(),
  status: text().$type<AssessmentInstance.AssessmentInstanceStatus>().notNull(),
  workflowStatus: text().$type<AssessmentInstance.AssessmentInstanceWorkflowStatus>().notNull(),
  dueDate: timestampUtcNullable({ withTimezone: true }),

  createdAt: timestampUtc({ withTimezone: true }).notNull(),
  updatedAt: timestampUtc({ withTimezone: true }).notNull(),
  deletedAt: timestampUtcNullable({ withTimezone: true }),

  createdBy: text().$type<Actor.MemberId>().notNull(),
  updatedBy: text().$type<Actor.MemberId>().notNull(),
  deletedBy: text().$type<Actor.MemberId>(),

  revisionId: text().$type<Base.RevisionId>().notNull(),
  orgId: text().$type<Actor.OrgId>().notNull(),
});
