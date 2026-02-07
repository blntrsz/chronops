import { Effect } from "effect";
import { describe } from "vitest";
import { expect, it } from "@effect/vitest";
import * as Comment from "../comment";
import * as Framework from "../framework";
import { makeTestRuntime, snapshot } from "./runtime";

describe("Comment", () => {
  const { runTest } = makeTestRuntime();

  it.effect("make/update/remove", () =>
    runTest(
      Effect.gen(function* () {
        const frameworkId = Framework.FrameworkId.make("fwk_01TEST999");
        const created = yield* Comment.make({
          entityId: frameworkId,
          body: "hello",
        });
        const updated = yield* Comment.update(created, { body: "updated" });
        const removed = yield* Comment.remove(updated);

        expect(snapshot(created)).toMatchInlineSnapshot(`
          {
            "body": "hello",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "entityId": "fwk_01TEST999",
            "id": "cmt_01TEST001",
            "orgId": "org_1",
            "revisionId": "01TEST000",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);

        expect(snapshot(updated)).toMatchInlineSnapshot(`
          {
            "body": "updated",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "entityId": "fwk_01TEST999",
            "id": "cmt_01TEST001",
            "orgId": "org_1",
            "revisionId": "01TEST002",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);

        expect(snapshot(removed)).toMatchInlineSnapshot(`
          {
            "body": "updated",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": "2024-01-01T00:00:00.000Z",
            "deletedBy": "mem_1",
            "entityId": "fwk_01TEST999",
            "id": "cmt_01TEST001",
            "orgId": "org_1",
            "revisionId": "01TEST003",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);
      }),
    ),
  );
});
