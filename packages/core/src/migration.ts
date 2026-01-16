import { PgMigrator } from "@effect/sql-pg";
import { fromFileSystem } from "@effect/sql/Migrator/FileSystem";
import { fileURLToPath } from "bun";
import { Effect, Layer } from "effect";
import { SqlLayer } from "./common/sql";
import {
  BunCommandExecutor,
  BunContext,
  BunFileSystem,
  BunPath,
  BunRuntime,
} from "@effect/platform-bun";

const EnvLayer = Layer.mergeAll(
  SqlLayer,
  BunFileSystem.layer,
  BunPath.layer,
  BunCommandExecutor.layer,
).pipe(Layer.provide(BunContext.layer));

const migrationsPath = fileURLToPath(new URL("../migrations", import.meta.url));

const program = Effect.gen(function* () {
  yield* Effect.logInfo("migration: start");
  yield* Effect.logInfo(`migration: migrationsPath=${migrationsPath}`);
  yield* Effect.logInfo(
    `migration: DATABASE_URL=${process.env.DATABASE_URL ?? "<missing>"}`,
  );

  yield* PgMigrator.run({
    loader: fromFileSystem(migrationsPath),
    schemaDirectory: "migrations",
  });

  yield* Effect.logInfo("migration: done");
}).pipe(
  Effect.catchAllDefect((defect) =>
    Effect.logError("migration failed", defect),
  ),
  Effect.catchAllCause((cause) =>
    Effect.logError("migration failed", cause).pipe(
      Effect.andThen(Effect.failCause(cause)),
    ),
  ),
  Effect.provide(EnvLayer),
);

program.pipe(BunRuntime.runMain);
