import { Config, String } from "effect";
import { PgClient } from "@effect/sql-pg";

export const SqlLayer = PgClient.layerConfig({
  url: Config.redacted("DATABASE_URL"),
  transformQueryNames: String.camelToSnake,
  transformResultNames: String.snakeToCamel,
});
