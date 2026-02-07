import { Effect } from "effect";
import { describe } from "vitest";
import { expect, it } from "@effect/vitest";
import * as Pdf from "../pdf";
import * as PdfPage from "../pdf-page";
import { makeTestRuntime, snapshot } from "./runtime";

describe("PdfPage", () => {
  const { runTest } = makeTestRuntime();

  it.effect("make/updateText/remove", () =>
    runTest(
      Effect.gen(function* () {
        const pdfId = Pdf.PdfId.make("pdf_01TEST999");
        const created = yield* PdfPage.make({
          pdfId,
          pageNumber: 1,
          storageKey: "key",
          storageProvider: "s3",
        });
        const updated = yield* PdfPage.updateText(created, "text");
        const removed = yield* PdfPage.remove(updated);

        expect(snapshot(created)).toMatchInlineSnapshot(`
          {
            "createdAt": "2024-01-01T00:00:00.000Z",
            "createdBy": "mem_1",
            "deletedAt": null,
            "deletedBy": null,
            "id": "pg_01TEST001",
            "orgId": "org_1",
            "pageNumber": 1,
            "pdfId": "pdf_01TEST999",
            "revisionId": "01TEST000",
            "storageKey": "key",
            "storageProvider": "s3",
            "textContent": null,
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
            "id": "pg_01TEST001",
            "orgId": "org_1",
            "pageNumber": 1,
            "pdfId": "pdf_01TEST999",
            "revisionId": "01TEST002",
            "storageKey": "key",
            "storageProvider": "s3",
            "textContent": "text",
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
            "id": "pg_01TEST001",
            "orgId": "org_1",
            "pageNumber": 1,
            "pdfId": "pdf_01TEST999",
            "revisionId": "01TEST003",
            "storageKey": "key",
            "storageProvider": "s3",
            "textContent": "text",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "updatedBy": "mem_1",
          }
        `);
      }),
    ),
  );
});
