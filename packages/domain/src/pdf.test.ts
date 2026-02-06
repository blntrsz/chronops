import { describe, test, expect } from "bun:test";
import { Effect } from "effect";
import * as Pdf from "@chronops/domain/Pdf";
import * as PdfPage from "@chronops/domain/PdfPage";
import { Base } from "@chronops/domain/Base";

const testContext = Base.ULIDLayer.pipe(
  Effect.provideService(Base.Actor, {
    memberId: "test-member" as any,
    orgId: "test-org" as any,
  }),
);

describe("Pdf Domain", () => {
  describe("make", () => {
    test("creates a PDF with initial values", async () => {
      const input = {
        title: "Test PDF",
        filename: "test.pdf",
        fileSize: 1024,
        contentType: "application/pdf",
        storageKey: "test-key",
      };

      const effect = Effect.gen(function* () {
        const pdf = yield* Pdf.make(input);
        expect(pdf.pageCount).toBe(0);
        expect(pdf.status).toBe("uploaded");
        expect(pdf.title).toBe("Test PDF");
        return pdf;
      }).pipe(Effect.provide(testContext));

      const result = await Effect.runPromise(effect);
      expect(result.pageCount).toBe(0);
      expect(result.status).toBe("uploaded");
    });

    test("generates unique IDs", async () => {
      const input = {
        title: "Test PDF",
        filename: "test.pdf",
        fileSize: 1024,
        contentType: "application/pdf",
        storageKey: "test-key",
      };

      const effect = Effect.gen(function* () {
        const pdf1 = yield* Pdf.make(input);
        const pdf2 = yield* Pdf.make({ ...input, storageKey: "test-key-2" });
        expect(pdf1.id).not.toBe(pdf2.id);
        expect(pdf1.id).toMatch(/^pdf_/);
        return { pdf1, pdf2 };
      }).pipe(Effect.provide(testContext));

      const result = await Effect.runPromise(effect);
      expect(result.pdf1.id).not.toBe(result.pdf2.id);
    });
  });

  describe("status transitions", () => {
    test("markProcessing updates status", async () => {
      const input = {
        title: "Test PDF",
        filename: "test.pdf",
        fileSize: 1024,
        contentType: "application/pdf",
        storageKey: "test-key",
      };

      const effect = Effect.gen(function* () {
        const pdf = yield* Pdf.make(input);
        const processing = yield* Pdf.markProcessing(pdf);
        expect(processing.status).toBe("processing");
        expect(processing.updatedAt).not.toEqual(pdf.updatedAt);
        return processing;
      }).pipe(Effect.provide(testContext));

      const result = await Effect.runPromise(effect);
      expect(result.status).toBe("processing");
    });

    test("markReady updates status and pageCount", async () => {
      const input = {
        title: "Test PDF",
        filename: "test.pdf",
        fileSize: 1024,
        contentType: "application/pdf",
        storageKey: "test-key",
      };

      const effect = Effect.gen(function* () {
        const pdf = yield* Pdf.make(input);
        const ready = yield* Pdf.markReady(pdf, 5);
        expect(ready.status).toBe("ready");
        expect(ready.pageCount).toBe(5);
        return ready;
      }).pipe(Effect.provide(testContext));

      const result = await Effect.runPromise(effect);
      expect(result.status).toBe("ready");
      expect(result.pageCount).toBe(5);
    });

    test("markFailed updates status", async () => {
      const input = {
        title: "Test PDF",
        filename: "test.pdf",
        fileSize: 1024,
        contentType: "application/pdf",
        storageKey: "test-key",
      };

      const effect = Effect.gen(function* () {
        const pdf = yield* Pdf.make(input);
        const failed = yield* Pdf.markFailed(pdf);
        expect(failed.status).toBe("failed");
        return failed;
      }).pipe(Effect.provide(testContext));

      const result = await Effect.runPromise(effect);
      expect(result.status).toBe("failed");
    });
  });

  describe("PdfNotFoundError", () => {
    test("creates error with correct message", () => {
      const error = Pdf.PdfNotFoundError.fromId("pdf_123" as any);
      expect(error.message).toBe("Pdf with id pdf_123 not found.");
      expect(error.entityType).toBe("Pdf");
      expect(error.entityId).toBe("pdf_123");
    });
  });
});

describe("PdfPage Domain", () => {
  describe("make", () => {
    test("creates a page with empty text", async () => {
      const input = {
        pdfId: "pdf_123" as any,
        pageNumber: 1,
        storageKey: "test-key/page-1",
      };

      const effect = Effect.gen(function* () {
        const page = yield* PdfPage.make(input);
        expect(page.textContent).toBe("");
        expect(page.pageNumber).toBe(1);
        return page;
      }).pipe(Effect.provide(testContext));

      const result = await Effect.runPromise(effect);
      expect(result.textContent).toBe("");
    });

    test("generates unique IDs", async () => {
      const input = {
        pdfId: "pdf_123" as any,
        pageNumber: 1,
        storageKey: "test-key/page-1",
      };

      const effect = Effect.gen(function* () {
        const page1 = yield* PdfPage.make(input);
        const page2 = yield* PdfPage.make({ ...input, storageKey: "test-key/page-2" });
        expect(page1.id).not.toBe(page2.id);
        expect(page1.id).toMatch(/^pg_/);
        return { page1, page2 };
      }).pipe(Effect.provide(testContext));

      const result = await Effect.runPromise(effect);
      expect(result.page1.id).not.toBe(result.page2.id);
    });
  });

  describe("updateText", () => {
    test("updates page text content", async () => {
      const input = {
        pdfId: "pdf_123" as any,
        pageNumber: 1,
        storageKey: "test-key/page-1",
      };

      const effect = Effect.gen(function* () {
        const page = yield* PdfPage.make(input);
        const updated = yield* PdfPage.updateText(page, "Sample text content");
        expect(updated.textContent).toBe("Sample text content");
        expect(updated.updatedAt).not.toEqual(page.updatedAt);
        return updated;
      }).pipe(Effect.provide(testContext));

      const result = await Effect.runPromise(effect);
      expect(result.textContent).toBe("Sample text content");
    });
  });

  describe("PdfPageNotFoundError", () => {
    test("creates error with correct message", () => {
      const error = PdfPage.PdfPageNotFoundError.fromId("pg_123" as any);
      expect(error.message).toBe("PdfPage with id pg_123 not found.");
      expect(error.entityType).toBe("PdfPage");
      expect(error.entityId).toBe("pg_123");
    });
  });
});
