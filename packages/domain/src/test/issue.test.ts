import { Effect } from "effect";
import { describe } from "vitest";
import { expect, it } from "@effect/vitest";
import * as Control from "../control";
import * as Issue from "../issue";
import * as Workflow from "../workflow";
import { makeTestRuntime, snapshot } from "./runtime";

describe("Issue", () => {
  const { runTest } = makeTestRuntime();

  it.effect("make/update/remove", () =>
    runTest(
      Effect.gen(function* () {
        const controlId = Control.ControlId.make("ctr_01TEST999");
        const created = yield* Issue.make({
          title: "Finding A",
          description: null,
          type: "finding",
          severity: "high",
          controlId,
          assessmentInstanceId: null,
          evidenceId: null,
          dueAt: null,
          resolvedAt: null,
        });
        const updated = yield* Issue.update(created, { status: "in_progress" });
        const removed = yield* Issue.remove(updated);

        expect(snapshot(created)).toMatchInlineSnapshot(`
          {
            "assessmentInstanceId": null,
            "controlId": "ctr_01TEST999",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "description": null,
            "dueAt": null,
            "evidenceId": null,
            "id": "iss_01TEST001",
            "orgId": "org_1",
            "resolvedAt": null,
            "revisionId": "01TEST000",
            "severity": "high",
            "status": "open",
            "title": "Finding A",
            "type": "finding",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);

        expect(snapshot(updated)).toMatchInlineSnapshot(`
          {
            "assessmentInstanceId": null,
            "controlId": "ctr_01TEST999",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "description": null,
            "dueAt": null,
            "evidenceId": null,
            "id": "iss_01TEST001",
            "orgId": "org_1",
            "resolvedAt": null,
            "revisionId": "01TEST002",
            "severity": "high",
            "status": "in_progress",
            "title": "Finding A",
            "type": "finding",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);

        expect(snapshot(removed)).toMatchInlineSnapshot(`
          {
            "assessmentInstanceId": null,
            "controlId": "ctr_01TEST999",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": "2024-01-01T00:00:00.000Z",
            "deletedBy": "mem_1",
            "description": null,
            "dueAt": null,
            "evidenceId": null,
            "id": "iss_01TEST001",
            "orgId": "org_1",
            "resolvedAt": null,
            "revisionId": "01TEST003",
            "severity": "high",
            "status": "in_progress",
            "title": "Finding A",
            "type": "finding",
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
        const workflow = yield* Workflow.make(Issue.IssueTemplate);
        const started = yield* Workflow.transition(workflow, "start");
        const resolved = yield* Workflow.transition(started, "resolve");
        const reopened = yield* Workflow.transition(resolved, "reopen");

        expect(started.state).toBe("in_progress");
        expect(resolved.state).toBe("resolved");
        expect(reopened.state).toBe("open");
      }),
    ),
  );
});
