import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { Actor, Base, Schedule, ScheduleRun } from "@chronops/domain";
import { timestampUtc, timestampUtcNullable } from "../common/db-type";

/**
 * Drizzle ORM table definition for Schedule.
 * @since 1.0.0
 * @category database
 */
export const scheduleTable = pgTable(
  "schedule",
  {
    id: text().notNull().$type<Schedule.ScheduleId>().primaryKey(),
    ticket: text().notNull().$type<Base.Ticket>(),
    cron: text().$type<Schedule.CronExpression>().notNull(),
    triggerType: text().$type<Schedule.TriggerType>().notNull(),

    createdAt: timestampUtc({ withTimezone: true }).notNull(),
    updatedAt: timestampUtc({ withTimezone: true }).notNull(),
    deletedAt: timestampUtcNullable({ withTimezone: true }),

    createdBy: text().$type<Actor.MemberId>().notNull(),
    updatedBy: text().$type<Actor.MemberId>().notNull(),
    deletedBy: text().$type<Actor.MemberId>(),

    revisionId: text().$type<Base.RevisionId>().notNull(),
    orgId: text().$type<Actor.OrgId>().notNull(),
  },
  (table) => [uniqueIndex("schedule_org_ticket_uidx").on(table.orgId, table.ticket)],
);

/**
 * Drizzle ORM table definition for ScheduleRun.
 * @since 1.0.0
 * @category database
 */
export const scheduleRunTable = pgTable(
  "schedule_run",
  {
    id: text().notNull().$type<ScheduleRun.ScheduleRunId>().primaryKey(),
    ticket: text().notNull().$type<Base.Ticket>(),
    scheduleId: text().notNull().$type<Schedule.ScheduleId>(),
    status: text().$type<ScheduleRun.ScheduleRunStatus>().notNull().default("in_progress"),
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
  (table) => [uniqueIndex("schedule_run_org_ticket_uidx").on(table.orgId, table.ticket)],
);
