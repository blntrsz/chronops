import { Effect } from "effect";
import { describe } from "vitest";
import { expect, it } from "@effect/vitest";
import * as Base from "../base";
import * as AssessmentTemplate from "../assessment-template";
import * as Control from "../control";
import { makeTestRuntime, snapshot } from "./runtime";

describe("AssessmentTemplate", () => {
  const { runTest } = makeTestRuntime();

  it.effect("make/update/remove", () =>
    runTest(
      Effect.gen(function* () {
        const controlId = Control.ControlId.make("ctr_01TEST999");
        const created = yield* AssessmentTemplate.make({
          ticket: Base.Ticket.make("AST-1"),
          controlId,
          name: "Quarterly access review",
          description: null,
        });
        const updated = yield* AssessmentTemplate.update(created, {
          description: "Scope: production systems",
          status: "active",
        });
        const removed = yield* AssessmentTemplate.remove(updated);

        expect(snapshot(created)).toMatchInlineSnapshot(`
          {
            "controlId": "ctr_01TEST999",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "description": null,
            "id": "ast_01TEST001",
            "name": "Quarterly access review",
            "orgId": "org_1",
            "revisionId": "01TEST000",
            "status": "draft",
            "ticket": "AST-1",
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
            "description": "Scope: production systems",
            "id": "ast_01TEST001",
            "name": "Quarterly access review",
            "orgId": "org_1",
            "revisionId": "01TEST002",
            "status": "active",
            "ticket": "AST-1",
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
            "description": "Scope: production systems",
            "id": "ast_01TEST001",
            "name": "Quarterly access review",
            "orgId": "org_1",
            "revisionId": "01TEST003",
            "status": "active",
            "ticket": "AST-1",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);
      }),
    ),
  );
});
