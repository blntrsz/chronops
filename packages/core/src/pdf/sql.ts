import { pgTable, text, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { Actor, Base, Pdf } from "@chronops/domain";
import { timestampUtc, timestampUtcNullable } from "../common/db-type";

/**
 * Drizzle ORM table definition for PDF documents.
 * @since 1.0.0
 * @category database
 */
export const pdfTable = pgTable(
  "pdf",
  {
    id: text().notNull().$type<Pdf.PdfId>().primaryKey(),
    ticket: text().notNull().$type<Base.Ticket>(),
    title: text().notNull(),
    filename: text().notNull(),
    fileSize: integer().notNull(),
    contentType: text().$type<Pdf.PdfContentType>().notNull(),
    pageCount: integer().notNull(),
    storageKey: text().notNull(),
    storageProvider: text().$type<Pdf.PdfStorageProvider>().notNull(),
    checksum: text().$type<Pdf.PdfChecksum>().notNull(),
    status: text().$type<Pdf.PdfStatus>().notNull(),

    createdAt: timestampUtc({ withTimezone: true }).notNull(),
    updatedAt: timestampUtc({ withTimezone: true }).notNull(),
    deletedAt: timestampUtcNullable({ withTimezone: true }),

    createdBy: text().$type<Actor.MemberId>().notNull(),
    updatedBy: text().$type<Actor.MemberId>().notNull(),
    deletedBy: text().$type<Actor.MemberId>(),

    revisionId: text().$type<Base.RevisionId>().notNull(),
    orgId: text().$type<Actor.OrgId>().notNull(),
  },
  (table) => [uniqueIndex("pdf_org_ticket_uidx").on(table.orgId, table.ticket)],
);
