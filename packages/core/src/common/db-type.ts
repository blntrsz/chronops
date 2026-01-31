import { DateTime, Schema } from "effect";
import { customType } from "drizzle-orm/pg-core";

export const timestampUtc = customType<{
  data: typeof Schema.DateTimeUtc.Type;
  driverData: Date;
  config: { withTimezone: boolean; precision?: number };
}>({
  dataType(config) {
    if (!config) return "timestamp";

    const precision = typeof config.precision !== "undefined" ? ` (${config.precision})` : "";
    return `timestamp${precision}${config.withTimezone ? " with time zone" : ""}`;
  },
  toDriver(value: DateTime.DateTime): Date {
    return DateTime.toDate(value);
  },
  fromDriver(value: Date): typeof Schema.DateTimeUtc.Type {
    return DateTime.toUtc(DateTime.unsafeFromDate(value));
  },
});
