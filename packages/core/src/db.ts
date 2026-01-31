import { Effect, Schema } from "effect";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { commentTable } from "./comment/sql";
import { controlTable } from "./control/sql";
import { frameworkTable } from "./framework/sql";
import * as auth from "./auth/sql";
import { DatabaseError } from "./db-error";

const tables = {
  comment: commentTable,
  control: controlTable,
  framework: frameworkTable,
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
  effect: Effect.gen(function* () {
    const use = <T>(fn: (client: typeof db) => Promise<T>) =>
      Effect.tryPromise({
        try: () => fn(db),
        catch: (cause) => new DatabaseError({ cause }),
      });

    return { use, tables };
  }),
}) {}
