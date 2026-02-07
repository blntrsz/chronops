import { Effect } from "effect";
import { describe } from "vitest";
import { expect, it } from "@effect/vitest";
import * as Schedule from "../schedule";
import { makeTestRuntime, snapshot } from "./runtime";

describe("Schedule", () => {
  const { runTest } = makeTestRuntime();

  it.effect("make/update/remove", () =>
    runTest(
      Effect.gen(function* () {
        const created = yield* Schedule.make({
          cron: "0 0 * * *",
          triggerType: "once",
        });
        const updated = yield* Schedule.update(created, { triggerType: "forever" });
        const removed = yield* Schedule.remove(updated);

        expect(snapshot(created)).toMatchInlineSnapshot(`
          {
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "cron": "0 0 * * *",
            "deletedAt": null,
            "deletedBy": null,
            "id": "sch_01TEST001",
            "orgId": "org_1",
            "revisionId": "01TEST000",
            "triggerType": "once",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);

        expect(snapshot(updated)).toMatchInlineSnapshot(`
          {
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "cron": "0 0 * * *",
            "deletedAt": null,
            "deletedBy": null,
            "id": "sch_01TEST001",
            "orgId": "org_1",
            "revisionId": "01TEST002",
            "triggerType": "forever",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);

        expect(snapshot(removed)).toMatchInlineSnapshot(`
          {
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "cron": "0 0 * * *",
            "deletedAt": "2024-01-01T00:00:00.000Z",
            "deletedBy": "mem_1",
            "id": "sch_01TEST001",
            "orgId": "org_1",
            "revisionId": "01TEST003",
            "triggerType": "forever",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);
      }),
    ),
  );
});
