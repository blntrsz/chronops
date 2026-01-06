import { Config, String } from "effect";
import { PgClient } from "@effect/sql-pg";

export const SqlLayer = PgClient.layerConfig({
  url: Config.redacted("DATABASE_URL"),
  transformQueryNames: Config.succeed(String.camelToSnake),
  transformResultNames: Config.succeed(String.snakeToCamel),
});
