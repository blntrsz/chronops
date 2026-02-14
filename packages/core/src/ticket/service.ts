import { Actor, Base } from "@chronops/domain";
import { and, eq } from "drizzle-orm";
import { Effect } from "effect";
import { Database } from "../db";
import { ULID } from "@chronops/domain/src/base";

export class TicketService extends Effect.Service<TicketService>()("TicketService", {
  dependencies: [Database.Default, ULID.Default],
  effect: Effect.gen(function* () {
    const { use, tables } = yield* Database;

    const next = Effect.fn(function* (orgId: Actor.OrgId, prefix: Base.TicketPrefix) {
      const serial = yield* use((db) =>
        db.transaction(async (tx) => {
          const [existing] = await tx
            .select({ serial: tables.ticketCounter.serial })
            .from(tables.ticketCounter)
            .where(
              and(eq(tables.ticketCounter.orgId, orgId), eq(tables.ticketCounter.prefix, prefix)),
            )
            .for("update");

          if (existing) {
            const nextSerial = existing.serial + 1;
            await tx
              .update(tables.ticketCounter)
              .set({ serial: nextSerial })
              .where(
                and(eq(tables.ticketCounter.orgId, orgId), eq(tables.ticketCounter.prefix, prefix)),
              );
            return nextSerial;
          }

          const inserted = await tx
            .insert(tables.ticketCounter)
            .values({ orgId, prefix, serial: 1 })
            .onConflictDoNothing()
            .returning({ serial: tables.ticketCounter.serial });

          if (inserted[0]) {
            return inserted[0].serial;
          }

          const [reloaded] = await tx
            .select({ serial: tables.ticketCounter.serial })
            .from(tables.ticketCounter)
            .where(
              and(eq(tables.ticketCounter.orgId, orgId), eq(tables.ticketCounter.prefix, prefix)),
            )
            .for("update");

          const nextSerial = (reloaded?.serial ?? 0) + 1;
          await tx
            .update(tables.ticketCounter)
            .set({ serial: nextSerial })
            .where(
              and(eq(tables.ticketCounter.orgId, orgId), eq(tables.ticketCounter.prefix, prefix)),
            );
          return nextSerial;
        }),
      );
      return Base.Ticket.make(`${prefix}-${serial}`);
    });

    return { next };
  }),
}) {}
