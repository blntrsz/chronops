import { Config, String } from "effect";
import { PgClient } from "@effect/sql-pg";
import pgTypes from "pg-types";

const makeTypeParser = (
  oid: pgTypes.TypeId,
  format?: pgTypes.TypeFormat,
): ((val: string) => string) =>
  customParsers[oid] ?? pgTypes.getTypeParser(oid, format);

const textParser = (val: string) => val;

const customParsers: Partial<Record<pgTypes.TypeId, (val: string) => string>> =
  {
    [114]: textParser, // json
    [1082]: textParser, // date
    [1114]: textParser, // timestamp
    [1184]: textParser, // timestamptz
    [3802]: textParser, // jsonb
  };

export const SqlLayer = PgClient.layerConfig({
  url: Config.redacted("DATABASE_URL"),
  transformQueryNames: Config.succeed(String.camelToSnake),
  transformResultNames: Config.succeed(String.snakeToCamel),
  types: Config.succeed({
    getTypeParser: makeTypeParser,
  }),
});
