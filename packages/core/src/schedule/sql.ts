import { pgTable, text, boolean } from "drizzle-orm/pg-core";
import { Actor, Base, Schedule, ScheduleRun } from "@chronops/domain";
import { timestampUtc, timestampUtcNullable } from "../common/db-type";

/**
 * Drizzle ORM table definition for Schedule.
 * @since 1.0.0
 * @category database
 */
export const scheduleTable = pgTable("schedule", {
  id: text().notNull().$type<Schedule.ScheduleId>().primaryKey(),
  cron: text().notNull(),
  triggerType: text().$type<Schedule.TriggerType>().notNull(),
  lastRanAt: timestampUtcNullable({ withTimezone: true }),

  createdAt: timestampUtc({ withTimezone: true }).notNull(),
  updatedAt: timestampUtc({ withTimezone: true }).notNull(),
  deletedAt: timestampUtcNullable({ withTimezone: true }),

  createdBy: text().$type<Actor.MemberId>().notNull(),
  updatedBy: text().$type<Actor.MemberId>().notNull(),
  deletedBy: text().$type<Actor.MemberId>(),

  hash: text().$type<Base.Hash>().notNull(),
  orgId: text().$type<Actor.OrgId>().notNull(),
});

/**
 * Drizzle ORM table definition for ScheduleRun.
 * @since 1.0.0
 * @category database
 */
export const scheduleRunTable = pgTable("schedule_run", {
  id: text().notNull().$type<ScheduleRun.ScheduleRunId>().primaryKey(),
  scheduleId: text().notNull().$type<Schedule.ScheduleId>(),
  status: text().$type<ScheduleRun.ScheduleRunStatus>().notNull().default("in_progress"),
  success: boolean().notNull().default(false),

  createdAt: timestampUtc({ withTimezone: true }).notNull(),
  updatedAt: timestampUtc({ withTimezone: true }).notNull(),
  deletedAt: timestampUtcNullable({ withTimezone: true }),

  createdBy: text().$type<Actor.MemberId>().notNull(),
  updatedBy: text().$type<Actor.MemberId>().notNull(),
  deletedBy: text().$type<Actor.MemberId>(),

  hash: text().$type<Base.Hash>().notNull(),
  orgId: text().$type<Actor.OrgId>().notNull(),
});
