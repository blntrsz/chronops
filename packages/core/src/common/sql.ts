import { Config } from "effect";
import { PgClient } from "@effect/sql-pg";

export const SqlLayer = PgClient.layerConfig({
  url: Config.redacted("DATABASE_URL"),
});
