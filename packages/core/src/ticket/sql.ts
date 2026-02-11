import { integer, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { Actor, Base } from "@chronops/domain";

export const ticketCounterTable = pgTable(
  "ticket_counter",
  {
    orgId: text().notNull().$type<Actor.OrgId>(),
    prefix: text().notNull().$type<Base.TicketPrefix>(),
    serial: integer().notNull(),
  },
  (table) => [uniqueIndex("ticket_counter_org_prefix_uidx").on(table.orgId, table.prefix)],
);
