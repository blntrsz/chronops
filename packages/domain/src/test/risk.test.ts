import { Effect } from "effect";
import { describe } from "vitest";
import { expect, it } from "@effect/vitest";
import * as Control from "../control";
import * as Risk from "../risk";
import * as Workflow from "../workflow";
import { makeTestRuntime, snapshot } from "./runtime";

describe("Risk", () => {
  const { runTest } = makeTestRuntime();

  it.effect("make/update/remove", () =>
    runTest(
      Effect.gen(function* () {
        const controlId = Control.ControlId.make("ctr_01TEST999");
        const created = yield* Risk.make({
          title: "Third-party outage",
          description: null,
          likelihood: "medium",
          impact: "high",
          score: 10,
          treatment: "mitigate",
          controlId,
        });
        const updated = yield* Risk.update(created, { status: "mitigated", score: 6 });
        const removed = yield* Risk.remove(updated);

        expect(snapshot(created)).toMatchInlineSnapshot(`
          {
            "controlId": "ctr_01TEST999",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "description": null,
            "id": "rsk_01TEST001",
            "impact": "high",
            "likelihood": "medium",
            "orgId": "org_1",
            "revisionId": "01TEST000",
            "score": 10,
            "status": "open",
            "title": "Third-party outage",
            "treatment": "mitigate",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);

        expect(snapshot(updated)).toMatchInlineSnapshot(`
          {
            "controlId": "ctr_01TEST999",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "description": null,
            "id": "rsk_01TEST001",
            "impact": "high",
            "likelihood": "medium",
            "orgId": "org_1",
            "revisionId": "01TEST002",
            "score": 6,
            "status": "mitigated",
            "title": "Third-party outage",
            "treatment": "mitigate",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);

        expect(snapshot(removed)).toMatchInlineSnapshot(`
          {
            "controlId": "ctr_01TEST999",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": "2024-01-01T00:00:00.000Z",
            "deletedBy": "mem_1",
            "description": null,
            "id": "rsk_01TEST001",
            "impact": "high",
            "likelihood": "medium",
            "orgId": "org_1",
            "revisionId": "01TEST003",
            "score": 6,
            "status": "mitigated",
            "title": "Third-party outage",
            "treatment": "mitigate",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);
      }),
    ),
  );

  it.effect("workflow transitions", () =>
    runTest(
      Effect.gen(function* () {
        const workflow = yield* Workflow.make(Risk.RiskTemplate);
        const mitigated = yield* Workflow.transition(workflow, "mitigate");
        const reopened = yield* Workflow.transition(mitigated, "reopen");

        expect(mitigated.state).toBe("mitigated");
        expect(reopened.state).toBe("open");
      }),
    ),
  );
});
