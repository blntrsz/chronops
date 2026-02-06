import { pgTable, text, integer } from "drizzle-orm/pg-core";
import { Actor, Base, Pdf, PdfPage } from "@chronops/domain";
import { timestampUtc, timestampUtcNullable } from "../common/db-type";

/**
 * Drizzle ORM table definition for PDF pages.
 * @since 1.0.0
 * @category database
 */
export const pdfPageTable = pgTable("pdf_page", {
  id: text().notNull().$type<PdfPage.PdfPageId>().primaryKey(),
  pdfId: text().notNull().$type<Pdf.PdfId>(),
  pageNumber: integer().notNull(),
  textContent: text(),
  storageKey: text().notNull(),
  storageProvider: text().$type<Pdf.PdfStorageProvider>().notNull(),

  createdAt: timestampUtc({ withTimezone: true }).notNull(),
  updatedAt: timestampUtc({ withTimezone: true }).notNull(),
  deletedAt: timestampUtcNullable({ withTimezone: true }),

  createdBy: text().$type<Actor.MemberId>().notNull(),
  updatedBy: text().$type<Actor.MemberId>().notNull(),
  deletedBy: text().$type<Actor.MemberId>(),

  revisionId: text().$type<Base.RevisionId>().notNull(),
  orgId: text().$type<Actor.OrgId>().notNull(),
});
