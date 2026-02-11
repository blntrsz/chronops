import { Effect } from "effect";
import { describe } from "vitest";
import { expect, it } from "@effect/vitest";
import * as Base from "../base";
import * as Control from "../control";
import * as Framework from "../framework";
import { makeTestRuntime, snapshot } from "./runtime";

describe("Control", () => {
  const { runTest } = makeTestRuntime();

  it.effect("make/update/remove", () =>
    runTest(
      Effect.gen(function* () {
        const frameworkId = Framework.FrameworkId.make("fwk_01TEST999");
        const created = yield* Control.make({
          ticket: Base.Ticket.make("CTR-1"),
          name: "Access",
          description: null,
          frameworkId,
          testingFrequency: null,
        });
        const updated = yield* Control.update(created, { testingFrequency: "monthly" });
        const removed = yield* Control.remove(updated);

        expect(snapshot(created)).toMatchInlineSnapshot(`
          {
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "description": null,
            "frameworkId": "fwk_01TEST999",
            "id": "ctr_01TEST001",
            "name": "Access",
            "orgId": "org_1",
            "revisionId": "01TEST000",
            "status": "draft",
            "ticket": "CTR-1",
            "testingFrequency": null,
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);

        expect(snapshot(updated)).toMatchInlineSnapshot(`
          {
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "description": null,
            "frameworkId": "fwk_01TEST999",
            "id": "ctr_01TEST001",
            "name": "Access",
            "orgId": "org_1",
            "revisionId": "01TEST002",
            "status": "draft",
            "ticket": "CTR-1",
            "testingFrequency": "monthly",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);

        expect(snapshot(removed)).toMatchInlineSnapshot(`
          {
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": "2024-01-01T00:00:00.000Z",
            "deletedBy": "mem_1",
            "description": null,
            "frameworkId": "fwk_01TEST999",
            "id": "ctr_01TEST001",
            "name": "Access",
            "orgId": "org_1",
            "revisionId": "01TEST003",
            "status": "draft",
            "ticket": "CTR-1",
            "testingFrequency": "monthly",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);
      }),
    ),
  );
});
