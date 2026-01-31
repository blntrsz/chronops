import { DateTime, Schema } from "effect";
import { customType } from "drizzle-orm/pg-core";

export const timestampUtc = customType<{
  data: typeof Schema.DateTimeUtc.Type;
  driverData: Date | string;
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
  fromDriver(value: Date | string): typeof Schema.DateTimeUtc.Type {
    const date = typeof value === "string" ? new Date(value) : value;
    return DateTime.toUtc(DateTime.unsafeFromDate(date));
  },
});

export const timestampUtcNullable = customType<{
  data: typeof Schema.DateTimeUtc.Type | null;
  driverData: Date | string | null;
  config: { withTimezone: boolean; precision?: number };
}>({
  dataType(config) {
    if (!config) return "timestamp";

    const precision = typeof config.precision !== "undefined" ? ` (${config.precision})` : "";
    return `timestamp${precision}${config.withTimezone ? " with time zone" : ""}`;
  },
  toDriver(value: DateTime.DateTime | null): Date | null {
    if (value === null) return null;
    return DateTime.toDate(value);
  },
  fromDriver(value: Date | string | null): typeof Schema.DateTimeUtc.Type | null {
    if (value === null) return null;
    const date = typeof value === "string" ? new Date(value) : value;
    return DateTime.toUtc(DateTime.unsafeFromDate(date));
  },
});
