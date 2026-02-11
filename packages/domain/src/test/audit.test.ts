import { Effect } from "effect";
import { describe } from "vitest";
import { expect, it } from "@effect/vitest";
import * as Base from "../base";
import * as AssessmentTemplate from "../assessment-template";
import * as Audit from "../audit";
import * as Control from "../control";
import { makeTestRuntime, snapshot } from "./runtime";

describe("Audit", () => {
  const { runTest } = makeTestRuntime();

  it.effect("make/update/remove", () =>
    runTest(
      Effect.gen(function* () {
        const assessmentMethodId = AssessmentTemplate.AssessmentTemplateId.make("ast_01TEST999");
        const created = yield* Audit.make({
          ticket: Base.Ticket.make("AUD-1"),
          name: "SOC 2 FY25",
          description: null,
          scope: "Security + Availability",
          assessmentMethodId,
        });
        const updated = yield* Audit.update(created, { status: "active" });
        const removed = yield* Audit.remove(updated);

        expect(snapshot(created)).toMatchInlineSnapshot(`
          {
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "description": null,
            "assessmentMethodId": "ast_01TEST999",
            "id": "aud_01TEST001",
            "name": "SOC 2 FY25",
            "orgId": "org_1",
            "revisionId": "01TEST000",
            "scope": "Security + Availability",
            "status": "draft",
            "ticket": "AUD-1",
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
            "assessmentMethodId": "ast_01TEST999",
            "id": "aud_01TEST001",
            "name": "SOC 2 FY25",
            "orgId": "org_1",
            "revisionId": "01TEST002",
            "scope": "Security + Availability",
            "status": "active",
            "ticket": "AUD-1",
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
            "assessmentMethodId": "ast_01TEST999",
            "id": "aud_01TEST001",
            "name": "SOC 2 FY25",
            "orgId": "org_1",
            "revisionId": "01TEST003",
            "scope": "Security + Availability",
            "status": "active",
            "ticket": "AUD-1",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);
      }),
    ),
  );

  it.effect("audit run lifecycle with assessment", () =>
    runTest(
      Effect.gen(function* () {
        const controlId = Control.ControlId.make("ctr_01TEST999");
        const template = yield* AssessmentTemplate.make({
          ticket: Base.Ticket.make("AST-1"),
          controlId,
          name: "Access review",
          description: null,
        });
        const audit = yield* Audit.make({
          ticket: Base.Ticket.make("AUD-2"),
          name: "SOC 2 FY25",
          description: null,
          scope: null,
          assessmentMethodId: template.id,
        });
        const run = yield* Audit.makeRun({
          ticket: Base.Ticket.make("ADR-1"),
          auditId: audit.id,
          assessmentMethodId: template.id,
        });
        const started = yield* Audit.startRun(run);
        const completed = yield* Audit.markRunCompleted(started);

        expect(snapshot(run)).toMatchInlineSnapshot(`
          {
            "assessmentMethodId": "ast_01TEST001",
            "auditId": "aud_01TEST003",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "finishedAt": null,
            "id": "adr_01TEST005",
            "orgId": "org_1",
            "revisionId": "01TEST004",
            "startedAt": null,
            "status": "planned",
            "ticket": "ADR-1",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);

        expect(snapshot(started)).toMatchInlineSnapshot(`
          {
            "assessmentMethodId": "ast_01TEST001",
            "auditId": "aud_01TEST003",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "finishedAt": null,
            "id": "adr_01TEST005",
            "orgId": "org_1",
            "revisionId": "01TEST006",
            "startedAt": "2024-01-01T00:00:00.000Z",
            "status": "in_progress",
            "ticket": "ADR-1",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);

        expect(snapshot(completed)).toMatchInlineSnapshot(`
          {
            "assessmentMethodId": "ast_01TEST001",
            "auditId": "aud_01TEST003",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "finishedAt": "2024-01-01T00:00:00.000Z",
            "id": "adr_01TEST005",
            "orgId": "org_1",
            "revisionId": "01TEST007",
            "startedAt": "2024-01-01T00:00:00.000Z",
            "status": "completed",
            "ticket": "ADR-1",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);
      }),
    ),
  );
});
