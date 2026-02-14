import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { timestampUtc, timestampUtcNullable } from "../common/db-type";
import { Actor, AssessmentInstance, AssessmentTemplate, Base, Control } from "@chronops/domain";

export const assessmentTemplateTable = pgTable("assessment_template", {
  id: text().notNull().$type<AssessmentTemplate.AssessmentTemplateId>().primaryKey(),
  ticket: text().notNull().$type<Base.Ticket>(),
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

export const assessmentInstanceTable = pgTable(
  "assessment_instance",
  {
    id: text().notNull().$type<AssessmentInstance.AssessmentInstanceId>().primaryKey(),
    ticket: text().notNull().$type<Base.Ticket>(),
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
  },
  (table) => [uniqueIndex("assessment_instance_org_ticket_uidx").on(table.orgId, table.ticket)],
);
