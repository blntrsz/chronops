import { Effect } from "effect";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { commentTable } from "./comment/sql";
import { controlTable } from "./control/sql";
import { evidenceTable } from "./evidence/sql";
import { frameworkTable } from "./framework/sql";
import { pdfTable } from "./pdf/sql";
import { pdfPageTable } from "./pdf-page/sql";
import { scheduleTable, scheduleRunTable } from "./schedule/sql";
import { assessmentTemplateTable } from "./assessment/template/sql";
import { assessmentInstanceTable } from "./assessment/instance/sql";
import * as auth from "./auth/sql";
import { DatabaseError } from "./db-error";

const tables = {
  comment: commentTable,
  control: controlTable,
  evidence: evidenceTable,
  framework: frameworkTable,
  pdf: pdfTable,
  pdfPage: pdfPageTable,
  schedule: scheduleTable,
  scheduleRun: scheduleRunTable,
  assessmentTemplate: assessmentTemplateTable,
  assessmentInstance: assessmentInstanceTable,
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
