import { PgMigrator } from "@effect/sql-pg";
import { fileURLToPath } from "bun";
import { Effect, Layer, pipe } from "effect";
import { SqlLayer } from "./common/sql";
import { BunContext, BunRuntime } from "@effect/platform-bun";

const MigratorLayer = PgMigrator.layer({
  loader: PgMigrator.fromFileSystem(
    fileURLToPath(new URL("../migrations", import.meta.url)),
  ),
  schemaDirectory: "migrations",
}).pipe(Layer.provide(SqlLayer));

const EnvLayer = Layer.mergeAll(SqlLayer, MigratorLayer).pipe(
  Layer.provide(BunContext.layer),
);

pipe(
  Effect.gen(function* () {}),
  Effect.provide(EnvLayer),
  BunRuntime.runMain,
);
