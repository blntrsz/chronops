import { Effect } from "effect";
import { describe } from "vitest";
import { expect, it } from "@effect/vitest";
import * as Pdf from "../pdf";
import { makeTestRuntime, snapshot } from "./runtime";

describe("Pdf", () => {
  const { runTest } = makeTestRuntime();

  it.effect("make/markProcessing/markReady/markFailed/remove", () =>
    runTest(
      Effect.gen(function* () {
        const created = yield* Pdf.make({
          title: "Policy",
          filename: "policy.pdf",
          fileSize: 100,
          contentType: "application/pdf",
          storageKey: "key",
          storageProvider: "local",
          checksum: Pdf.PdfChecksum.make("sum"),
        });
        const processing = yield* Pdf.markProcessing(created);
        const ready = yield* Pdf.markReady(processing, 2);
        const failed = yield* Pdf.markFailed(processing);
        const removed = yield* Pdf.remove(ready);

        expect(snapshot(created)).toMatchInlineSnapshot(`
          {
            "checksum": "sum",
            "contentType": "application/pdf",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "fileSize": 100,
            "filename": "policy.pdf",
            "id": "pdf_01TEST001",
            "orgId": "org_1",
            "pageCount": 0,
            "revisionId": "01TEST000",
            "status": "uploaded",
            "storageKey": "key",
            "storageProvider": "local",
            "title": "Policy",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);

        expect(snapshot(processing)).toMatchInlineSnapshot(`
          {
            "checksum": "sum",
            "contentType": "application/pdf",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "fileSize": 100,
            "filename": "policy.pdf",
            "id": "pdf_01TEST001",
            "orgId": "org_1",
            "pageCount": 0,
            "revisionId": "01TEST002",
            "status": "processing",
            "storageKey": "key",
            "storageProvider": "local",
            "title": "Policy",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);

        expect(snapshot(ready)).toMatchInlineSnapshot(`
          {
            "checksum": "sum",
            "contentType": "application/pdf",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "fileSize": 100,
            "filename": "policy.pdf",
            "id": "pdf_01TEST001",
            "orgId": "org_1",
            "pageCount": 2,
            "revisionId": "01TEST003",
            "status": "ready",
            "storageKey": "key",
            "storageProvider": "local",
            "title": "Policy",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);

        expect(snapshot(failed)).toMatchInlineSnapshot(`
          {
            "checksum": "sum",
            "contentType": "application/pdf",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "fileSize": 100,
            "filename": "policy.pdf",
            "id": "pdf_01TEST001",
            "orgId": "org_1",
            "pageCount": 0,
            "revisionId": "01TEST004",
            "status": "failed",
            "storageKey": "key",
            "storageProvider": "local",
            "title": "Policy",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);

        expect(snapshot(removed)).toMatchInlineSnapshot(`
          {
            "checksum": "sum",
            "contentType": "application/pdf",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": "2024-01-01T00:00:00.000Z",
            "deletedBy": "mem_1",
            "fileSize": 100,
            "filename": "policy.pdf",
            "id": "pdf_01TEST001",
            "orgId": "org_1",
            "pageCount": 2,
            "revisionId": "01TEST005",
            "status": "ready",
            "storageKey": "key",
            "storageProvider": "local",
            "title": "Policy",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);
      }),
    ),
  );
});
