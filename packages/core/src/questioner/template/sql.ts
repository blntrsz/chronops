import { pgTable, text } from "drizzle-orm/pg-core";
import { Actor, Base, QuestionerTemplate } from "@chronops/domain";
import { timestampUtc, timestampUtcNullable } from "../../common/db-type";

export const questionerTemplateTable = pgTable("questioner_template", {
  id: text().notNull().$type<QuestionerTemplate.QuestionerTemplateId>().primaryKey(),
  name: text().notNull(),
  description: text(),
  questions: text().notNull(),

  createdAt: timestampUtc({ withTimezone: true }).notNull(),
  updatedAt: timestampUtc({ withTimezone: true }).notNull(),
  deletedAt: timestampUtcNullable({ withTimezone: true }),

  createdBy: text().$type<Actor.MemberId>().notNull(),
  updatedBy: text().$type<Actor.MemberId>().notNull(),
  deletedBy: text().$type<Actor.MemberId>(),

  revisionId: text().$type<Base.RevisionId>().notNull(),
  orgId: text().$type<Actor.OrgId>().notNull(),
});
