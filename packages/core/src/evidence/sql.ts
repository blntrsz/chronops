import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { Actor, Base, Control, Evidence, Pdf } from "@chronops/domain";
import { timestampUtc, timestampUtcNullable } from "../common/db-type";

export const evidenceTable = pgTable("evidence", {
  id: text().notNull().$type<Evidence.EvidenceId>().primaryKey(),
  title: text().notNull(),
  description: text(),
  controlId: text().$type<Control.ControlId>(),
  sourceType: text().$type<Evidence.EvidenceSourceType>().notNull(),
  pdfId: text().$type<Pdf.PdfId>(),
  linkUrl: text(),
  collectedAt: timestampUtcNullable({ withTimezone: true }),
  retentionDays: integer().$type<Evidence.EvidenceRetentionDays>(),
  retentionEndsAt: timestampUtcNullable({ withTimezone: true }),
  status: text().$type<Evidence.EvidenceStatus>().notNull(),

  createdAt: timestampUtc({ withTimezone: true }).notNull(),
  updatedAt: timestampUtc({ withTimezone: true }).notNull(),
  deletedAt: timestampUtcNullable({ withTimezone: true }),

  createdBy: text().$type<Actor.MemberId>().notNull(),
  updatedBy: text().$type<Actor.MemberId>().notNull(),
  deletedBy: text().$type<Actor.MemberId>(),

  revisionId: text().$type<Base.RevisionId>().notNull(),
  orgId: text().$type<Actor.OrgId>().notNull(),
});
