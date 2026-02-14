import { Effect } from "effect";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { commentTable } from "./comment/sql";
import { controlTable } from "./control/sql";
import { evidenceTable } from "./evidence/sql";
import { frameworkTable } from "./framework/sql";
import { issueTable } from "./issue/sql";
import { eventTable } from "./event/sql";
import { policyTable } from "./policy/sql";
import { pdfTable, pdfPageTable } from "./pdf/sql";
import { riskTable } from "./risk/sql";
import { scheduleTable, scheduleRunTable } from "./schedule/sql";
import { assessmentTemplateTable, assessmentInstanceTable } from "./assessment/sql";
import { auditRunTable, auditTable } from "./audit/sql";
import { questionerTemplateTable, questionerInstanceTable } from "./questioner/sql";
import * as auth from "./auth/sql";
import { ticketCounterTable } from "./ticket/sql";
import { DatabaseError } from "./db-error";

const tables = {
  comment: commentTable,
  control: controlTable,
  evidence: evidenceTable,
  framework: frameworkTable,
  issue: issueTable,
  event: eventTable,
  policy: policyTable,
  pdf: pdfTable,
  pdfPage: pdfPageTable,
  risk: riskTable,
  schedule: scheduleTable,
  scheduleRun: scheduleRunTable,
  assessmentTemplate: assessmentTemplateTable,
  assessmentInstance: assessmentInstanceTable,
  audit: auditTable,
  auditRun: auditRunTable,
  questionerTemplate: questionerTemplateTable,
  questionerInstance: questionerInstanceTable,
  ticketCounter: ticketCounterTable,
  ...auth,
} as const;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle(pool, {
  logger: true,
  casing: "snake_case",
  schema: tables,
});

export class Database extends Effect.Service<Database>()("Database", {
  // oxlint-disable-next-line eslint(require-yield)
  effect: Effect.gen(function* () {
    const use = <T>(fn: (client: typeof db) => Promise<T>) =>
      Effect.tryPromise({
        try: () => fn(db),
        catch: (cause) => new DatabaseError({ cause }),
      });

    return { use, tables };
  }),
}) {}
