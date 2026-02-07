import { Effect } from "effect";
import { describe } from "vitest";
import { expect, it } from "@effect/vitest";
import * as Base from "../base";
import { makeTestRuntime, snapshot } from "./runtime";

describe("Base", () => {
  const { runTest } = makeTestRuntime();

  it.effect("make/update/remove", () =>
    runTest(
      Effect.gen(function* () {
        const base = yield* Base.makeBase();
        const updated = yield* Base.updateBase();
        const removed = yield* Base.removeBase();

        expect(snapshot(base)).toMatchInlineSnapshot(`
          {
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "orgId": "org_1",
            "revisionId": "01TEST000",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);

        expect(snapshot(updated)).toMatchInlineSnapshot(`
          {
            "revisionId": "01TEST001",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);

        expect(snapshot(removed)).toMatchInlineSnapshot(`
          {
            "deletedAt": "2024-01-01T00:00:00.000Z",
            "deletedBy": "mem_1",
            "revisionId": "01TEST002",
          }
        `);
      }),
    ),
  );
});
