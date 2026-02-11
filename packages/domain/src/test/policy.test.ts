import { Effect } from "effect";
import { describe } from "vitest";
import { expect, it } from "@effect/vitest";
import * as Base from "../base";
import * as Control from "../control";
import * as Policy from "../policy";
import * as Workflow from "../workflow";
import { makeTestRuntime, snapshot } from "./runtime";

describe("Policy", () => {
  const { runTest } = makeTestRuntime();

  it.effect("make/update/remove", () =>
    runTest(
      Effect.gen(function* () {
        const controlId = Control.ControlId.make("ctr_01TEST999");
        const created = yield* Policy.make({
          ticket: Base.Ticket.make("POL-1"),
          title: "Access control policy",
          description: null,
          version: "1.0.0",
          effectiveAt: null,
          reviewDueAt: null,
          reviewFrequency: "annual",
          ownerId: null,
          controlId,
        });
        const updated = yield* Policy.update(created, { status: "active", reviewDueAt: null });
        const removed = yield* Policy.remove(updated);

        expect(snapshot(created)).toMatchInlineSnapshot(`
          {
            "controlId": "ctr_01TEST999",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "description": null,
            "effectiveAt": null,
            "id": "pol_01TEST001",
            "orgId": "org_1",
            "ownerId": null,
            "reviewDueAt": null,
            "reviewFrequency": "annual",
            "revisionId": "01TEST000",
            "status": "draft",
            "ticket": "POL-1",
            "title": "Access control policy",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
            "version": "1.0.0",
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
            "effectiveAt": null,
            "id": "pol_01TEST001",
            "orgId": "org_1",
            "ownerId": null,
            "reviewDueAt": null,
            "reviewFrequency": "annual",
            "revisionId": "01TEST002",
            "status": "active",
            "ticket": "POL-1",
            "title": "Access control policy",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
            "version": "1.0.0",
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
            "effectiveAt": null,
            "id": "pol_01TEST001",
            "orgId": "org_1",
            "ownerId": null,
            "reviewDueAt": null,
            "reviewFrequency": "annual",
            "revisionId": "01TEST003",
            "status": "active",
            "ticket": "POL-1",
            "title": "Access control policy",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
            "version": "1.0.0",
          }
        `);
      }),
    ),
  );

  it.effect("workflow transitions", () =>
    runTest(
      Effect.gen(function* () {
        const workflow = yield* Workflow.make(Policy.PolicyTemplate);
        const active = yield* Workflow.transition(workflow, "activate");

        expect(active.state).toBe("active");
      }),
    ),
  );
});
