import { Redacted, String } from "effect";
import { PgClient } from "@effect/sql-pg";
import pgTypes from "pg-types";

const textParser = (val: string) => val;

const customParsers: Partial<Record<pgTypes.TypeId, (val: string) => string>> = {
  [114]: textParser,   // json
  [1082]: textParser,  // date
  [1114]: textParser,  // timestamp
  [1184]: textParser,  // timestamptz
  [3802]: textParser,  // jsonb
};

export const SqlLayer = PgClient.layer({
  url: Redacted.make("postgresql://postgres:postgres@localhost:4321/postgres"),
  transformQueryNames: String.camelToSnake,
  transformResultNames: String.snakeToCamel,
  types: {
    getTypeParser: (oid, format) =>
      customParsers[oid] ?? pgTypes.getTypeParser(oid, format),
  },
});
