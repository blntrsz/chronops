import { Effect } from "effect";
import { describe } from "vitest";
import { expect, it } from "@effect/vitest";
import * as Base from "../base";
import * as AssessmentInstance from "../assessment-instance";
import * as AssessmentTemplate from "../assessment-template";
import * as Control from "../control";
import { makeTestRuntime, snapshot } from "./runtime";

describe("AssessmentInstance", () => {
  const { runTest } = makeTestRuntime();

  it.effect("make/update/remove", () =>
    runTest(
      Effect.gen(function* () {
        const controlId = Control.ControlId.make("ctr_01TEST999");
        const templateId = AssessmentTemplate.AssessmentTemplateId.make("ast_01TEST777");
        const created = yield* AssessmentInstance.make({
          ticket: Base.Ticket.make("ASI-1"),
          templateId,
          controlId,
          name: "Q1 access review",
          dueDate: null,
        });
        const updated = yield* AssessmentInstance.update(created, {
          status: "in_progress",
          workflowStatus: "active",
        });
        const removed = yield* AssessmentInstance.remove(updated);

        expect(snapshot(created)).toMatchInlineSnapshot(`
          {
            "controlId": "ctr_01TEST999",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "dueDate": null,
            "id": "asi_01TEST001",
            "name": "Q1 access review",
            "orgId": "org_1",
            "revisionId": "01TEST000",
            "status": "planned",
            "ticket": "ASI-1",
            "templateId": "ast_01TEST777",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
            "workflowStatus": "draft",
          }
        `);

        expect(snapshot(updated)).toMatchInlineSnapshot(`
          {
            "controlId": "ctr_01TEST999",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "dueDate": null,
            "id": "asi_01TEST001",
            "name": "Q1 access review",
            "orgId": "org_1",
            "revisionId": "01TEST002",
            "status": "in_progress",
            "ticket": "ASI-1",
            "templateId": "ast_01TEST777",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
            "workflowStatus": "active",
          }
        `);

        expect(snapshot(removed)).toMatchInlineSnapshot(`
          {
            "controlId": "ctr_01TEST999",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": "2024-01-01T00:00:00.000Z",
            "deletedBy": "mem_1",
            "dueDate": null,
            "id": "asi_01TEST001",
            "name": "Q1 access review",
            "orgId": "org_1",
            "revisionId": "01TEST003",
            "status": "in_progress",
            "ticket": "ASI-1",
            "templateId": "ast_01TEST777",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
            "workflowStatus": "active",
          }
        `);
      }),
    ),
  );
});
