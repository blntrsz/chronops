import { Effect } from "effect";
import { describe } from "vitest";
import { expect, it } from "@effect/vitest";
import * as Schedule from "../schedule";
import * as ScheduleRun from "../schedule-run";
import { makeTestRuntime, snapshot } from "./runtime";

describe("ScheduleRun", () => {
  const { runTest } = makeTestRuntime();

  it.effect("make/markSuccess/markFailure", () =>
    runTest(
      Effect.gen(function* () {
        const scheduleId = Schedule.ScheduleId.make("sch_01TEST999");
        const created = yield* ScheduleRun.make({ scheduleId });
        const succeeded = yield* ScheduleRun.markSuccess(created);
        const failed = yield* ScheduleRun.markFailure(created);

        expect(snapshot(created)).toMatchInlineSnapshot(`
          {
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "finishedAt": null,
            "id": "srn_01TEST001",
            "orgId": "org_1",
            "revisionId": "01TEST000",
            "scheduleId": "sch_01TEST999",
            "status": "in_progress",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);

        expect(snapshot(succeeded)).toMatchInlineSnapshot(`
          {
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "finishedAt": "2024-01-01T00:00:00.000Z",
            "id": "srn_01TEST001",
            "orgId": "org_1",
            "revisionId": "01TEST002",
            "scheduleId": "sch_01TEST999",
            "status": "success",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);

        expect(snapshot(failed)).toMatchInlineSnapshot(`
          {
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "finishedAt": "2024-01-01T00:00:00.000Z",
            "id": "srn_01TEST001",
            "orgId": "org_1",
            "revisionId": "01TEST003",
            "scheduleId": "sch_01TEST999",
            "status": "failed",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);
      }),
    ),
  );
});
