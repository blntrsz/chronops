import { pgTable, text } from "drizzle-orm/pg-core";
import { Actor, Base, QuestionerInstance, QuestionerTemplate } from "@chronops/domain";
import { timestampUtc, timestampUtcNullable } from "../../common/db-type";

export const questionerInstanceTable = pgTable("questioner_instance", {
  id: text().notNull().$type<QuestionerInstance.QuestionerInstanceId>().primaryKey(),
  templateId: text().notNull().$type<QuestionerTemplate.QuestionerTemplateId>(),
  name: text().notNull(),
  workflowStatus: text().$type<QuestionerInstance.QuestionerWorkflowStatus>().notNull(),
  responses: text().notNull(),
  submittedAt: timestampUtcNullable({ withTimezone: true }),
  submittedBy: text().$type<Actor.MemberId>(),

  createdAt: timestampUtc({ withTimezone: true }).notNull(),
  updatedAt: timestampUtc({ withTimezone: true }).notNull(),
  deletedAt: timestampUtcNullable({ withTimezone: true }),

  createdBy: text().$type<Actor.MemberId>().notNull(),
  updatedBy: text().$type<Actor.MemberId>().notNull(),
  deletedBy: text().$type<Actor.MemberId>(),

  revisionId: text().$type<Base.RevisionId>().notNull(),
  orgId: text().$type<Actor.OrgId>().notNull(),
});
