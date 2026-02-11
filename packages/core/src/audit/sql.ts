import { index, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { Actor, AssessmentTemplate, Audit, Base } from "@chronops/domain";
import { timestampUtc, timestampUtcNullable } from "../common/db-type";

export const auditTable = pgTable(
  "audit",
  {
    id: text().notNull().$type<Audit.AuditId>().primaryKey(),
    ticket: text().notNull().$type<Base.Ticket>(),
    name: text().notNull(),
    description: text(),
    scope: text(),
    assessmentMethodId: text().notNull().$type<AssessmentTemplate.AssessmentTemplateId>(),
    status: text().$type<Audit.AuditStatus>().notNull(),

    createdAt: timestampUtc({ withTimezone: true }).notNull(),
    updatedAt: timestampUtc({ withTimezone: true }).notNull(),
    deletedAt: timestampUtcNullable({ withTimezone: true }),

    createdBy: text().$type<Actor.MemberId>().notNull(),
    updatedBy: text().$type<Actor.MemberId>().notNull(),
    deletedBy: text().$type<Actor.MemberId>(),

    revisionId: text().$type<Base.RevisionId>().notNull(),
    orgId: text().$type<Actor.OrgId>().notNull(),
  },
  (table) => [
    uniqueIndex("audit_org_ticket_uidx").on(table.orgId, table.ticket),
    index("audit_org_id_idx").on(table.orgId),
    index("audit_status_idx").on(table.status),
    index("audit_assessment_method_id_idx").on(table.assessmentMethodId),
  ],
);

export const auditRunTable = pgTable(
  "audit_run",
  {
    id: text().notNull().$type<Audit.AuditRunId>().primaryKey(),
    ticket: text().notNull().$type<Base.Ticket>(),
    auditId: text().notNull().$type<Audit.AuditId>(),
    assessmentMethodId: text().notNull().$type<AssessmentTemplate.AssessmentTemplateId>(),
    status: text().$type<Audit.AuditRunStatus>().notNull(),
    startedAt: timestampUtcNullable({ withTimezone: true }),
    finishedAt: timestampUtcNullable({ withTimezone: true }),

    createdAt: timestampUtc({ withTimezone: true }).notNull(),
    updatedAt: timestampUtc({ withTimezone: true }).notNull(),
    deletedAt: timestampUtcNullable({ withTimezone: true }),

    createdBy: text().$type<Actor.MemberId>().notNull(),
    updatedBy: text().$type<Actor.MemberId>().notNull(),
    deletedBy: text().$type<Actor.MemberId>(),

    revisionId: text().$type<Base.RevisionId>().notNull(),
    orgId: text().$type<Actor.OrgId>().notNull(),
  },
  (table) => [
    uniqueIndex("audit_run_org_ticket_uidx").on(table.orgId, table.ticket),
    index("audit_run_org_id_idx").on(table.orgId),
    index("audit_run_audit_id_idx").on(table.auditId),
    index("audit_run_status_idx").on(table.status),
    index("audit_run_assessment_method_id_idx").on(table.assessmentMethodId),
  ],
);
