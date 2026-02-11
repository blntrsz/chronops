import { Effect } from "effect";
import { describe } from "vitest";
import { expect, it } from "@effect/vitest";
import * as Base from "../base";
import * as Framework from "../framework";
import { makeTestRuntime, snapshot } from "./runtime";

describe("Framework", () => {
  const { runTest } = makeTestRuntime();

  it.effect("make/update/remove", () =>
    runTest(
      Effect.gen(function* () {
        const created = yield* Framework.make({
          ticket: Base.Ticket.make("FWK-1"),
          name: "SOC 2",
          description: null,
          version: Framework.SemVer.make("1.0.0"),
        });
        const updated = yield* Framework.update(created, { description: "desc" });
        const removed = yield* Framework.remove(updated);

        expect(snapshot(created)).toMatchInlineSnapshot(`
          {
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "description": null,
            "id": "fwk_01TEST001",
            "name": "SOC 2",
            "orgId": "org_1",
            "revisionId": "01TEST000",
            "status": "draft",
            "ticket": "FWK-1",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
            "version": "1.0.0",
          }
        `);

        expect(snapshot(updated)).toMatchInlineSnapshot(`
          {
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "description": "desc",
            "id": "fwk_01TEST001",
            "name": "SOC 2",
            "orgId": "org_1",
            "revisionId": "01TEST002",
            "status": "draft",
            "ticket": "FWK-1",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
            "version": "1.0.0",
          }
        `);

        expect(snapshot(removed)).toMatchInlineSnapshot(`
          {
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": "2024-01-01T00:00:00.000Z",
            "deletedBy": "mem_1",
            "description": "desc",
            "id": "fwk_01TEST001",
            "name": "SOC 2",
            "orgId": "org_1",
            "revisionId": "01TEST003",
            "status": "draft",
            "ticket": "FWK-1",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
            "version": "1.0.0",
          }
        `);
      }),
    ),
  );
});
