import { Effect, Schema } from "effect";
import { drizzle } from "drizzle-orm/node-postgres";
import { commentTable } from "./comment/sql";
import { controlTable } from "./control/sql";
import { frameworkTable } from "./framework/sql";

const tables = {
  comment: commentTable,
  control: controlTable,
  framework: frameworkTable,
} as const;

export const db = drizzle(process.env.DATABASE_URL!, {
  logger: true,
  casing: "snake_case",
  schema: tables,
});

export class DatabaseError extends Schema.TaggedError<DatabaseError>("DatabaseError")(
  "DatabaseError",
  {
    cause: Schema.Unknown,
  },
) {}

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
