import { describe, it, expect } from "bun:test";
import { DateTime, Schema } from "effect";
import { MemberId, OrgId, WorkflowId, Hash, Base, NotFoundError, ULID, ULIDLayer } from "../base";
import { FrameworkId, Framework, CreateFramework, UpdateFramework, FrameworkNotFoundError } from "../framework";
import { ControlId, ControlStatus, Control, CreateControl, ControlNotFoundError } from "../control";

// Helper to compare branded types
const asString = (value: unknown) => value as string;

// Helper to create DateTime.Utc from ISO string
const dt = (iso: string) => DateTime.unsafeMake(new Date(iso));

describe("Base Domain", () => {
  describe("MemberId", () => {
    it("should create a valid MemberId", () => {
      const id = MemberId.make("mem_abc123");
      expect(asString(id)).toBe("mem_abc123");
    });
  });

  describe("OrgId", () => {
    it("should create a valid OrgId", () => {
      const id = OrgId.make("org_abc123");
      expect(asString(id)).toBe("org_abc123");
    });
  });

  describe("WorkflowId", () => {
    it("should create a valid WorkflowId", () => {
      const id = WorkflowId.make("wf_abc123");
      expect(asString(id)).toBe("wf_abc123");
    });
  });

  describe("Hash", () => {
    it("should create a valid Hash", () => {
      const hash = Hash.make("abc123hash");
      expect(asString(hash)).toBe("abc123hash");
    });
  });

  describe("NotFoundError", () => {
    it("should create error from id", () => {
      const error = NotFoundError.fromId("User", "user-123");
      expect(error.message).toBe("User with id user-123 not found.");
      expect(error.entityType).toBe("User");
      expect(error.entityId).toBe("user-123");
    });

    it("should create error from type only", () => {
      const error = NotFoundError.fromType("Framework");
      expect(error.message).toBe("Framework not found.");
      expect(error.entityType).toBe("Framework");
      expect(error.entityId).toBeUndefined();
    });
  });

  describe("Base Schema", () => {
    it("should have all required fields", () => {
      const testDate = dt("2024-01-01T00:00:00Z");
      const base = Base.make({
        createdAt: testDate,
        updatedAt: testDate,
        deletedAt: undefined,
        createdBy: MemberId.make("mem_test"),
        updatedBy: MemberId.make("mem_test"),
        deletedBy: undefined,
        hash: Hash.make("hash123"),
        orgId: OrgId.make("org_test"),
        workflowId: WorkflowId.make("wf_test"),
      });

      expect(base.createdAt).toEqual(testDate);
      expect(base.updatedAt).toEqual(testDate);
      expect(asString(base.orgId)).toBe("org_test");
      expect(asString(base.workflowId)).toBe("wf_test");
    });
  });
});

describe("Framework Domain", () => {
  describe("FrameworkId", () => {
    it("should create a valid FrameworkId", () => {
      const id = FrameworkId.make("fwk_test");
      expect(asString(id)).toBe("fwk_test");
    });
  });

  describe("Framework Schema", () => {
    it("should create a valid Framework", () => {
      const testDate = dt("2024-01-01T00:00:00Z");
      const framework = Framework.make({
        id: FrameworkId.make("fwk_test"),
        name: "SOC 2",
        description: "SOC 2 Compliance Framework",
        version: "2024",
        sourceUrl: "https://example.com/soc2",
        createdAt: testDate,
        updatedAt: testDate,
        deletedAt: undefined,
        createdBy: MemberId.make("mem_test"),
        updatedBy: MemberId.make("mem_test"),
        deletedBy: undefined,
        hash: Hash.make("hash123"),
        orgId: OrgId.make("org_test"),
        workflowId: WorkflowId.make("wf_test"),
      });

      expect(asString(framework.id)).toBe("fwk_test");
      expect(framework.name).toBe("SOC 2");
      expect(framework.description).toBe("SOC 2 Compliance Framework");
    });

    it("should allow optional fields to be undefined", () => {
      const testDate = dt("2024-01-01T00:00:00Z");
      const framework = Framework.make({
        id: FrameworkId.make("fwk_test"),
        name: "ISO 27001",
        createdAt: testDate,
        updatedAt: testDate,
        deletedAt: undefined,
        createdBy: MemberId.make("mem_test"),
        updatedBy: MemberId.make("mem_test"),
        deletedBy: undefined,
        hash: Hash.make("hash123"),
        orgId: OrgId.make("org_test"),
        workflowId: WorkflowId.make("wf_test"),
      });

      expect(framework.version).toBeUndefined();
      expect(framework.sourceUrl).toBeUndefined();
    });
  });

  describe("CreateFramework", () => {
    it("should have correct structure", () => {
      const input = {
        name: "GDPR",
        description: "Data Protection",
        version: "2024",
        sourceUrl: "https://example.com/gdpr",
      };

      const decoded = Schema.decodeUnknownSync(CreateFramework)(input);
      expect(decoded.name).toBe("GDPR");
    });
  });

  describe("UpdateFramework", () => {
    it("should allow partial updates", () => {
      const input = {
        name: "Updated Name",
      };

      const decoded = Schema.decodeUnknownSync(UpdateFramework)(input);
      expect(decoded.name).toBe("Updated Name");
    });
  });

  describe("FrameworkNotFoundError", () => {
    it("should create error with entity type", () => {
      const error = FrameworkNotFoundError.fromId(
        FrameworkId.make("fwk_123"),
      );
      expect(error.message).toBe("Framework with id fwk_123 not found.");
      expect(error.entityType).toBe("Framework");
    });
  });
});

describe("Control Domain", () => {
  describe("ControlId", () => {
    it("should create a valid ControlId", () => {
      const id = ControlId.make("ctr_test");
      expect(asString(id)).toBe("ctr_test");
    });
  });

  describe("ControlStatus", () => {
    it("should accept draft status", () => {
      const status: ControlStatus = "draft";
      expect(status).toBe("draft");
    });

    it("should accept active status", () => {
      const status: ControlStatus = "active";
      expect(status).toBe("active");
    });

    it("should accept deprecated status", () => {
      const status: ControlStatus = "deprecated";
      expect(status).toBe("deprecated");
    });
  });

  describe("Control Schema", () => {
    it("should create a valid Control", () => {
      const testDate = dt("2024-01-01T00:00:00Z");
      const control = Control.make({
        id: ControlId.make("ctr_test"),
        name: "Access Control",
        description: "Control access to systems",
        frameworkId: FrameworkId.make("fwk_test"),
        status: "active" as ControlStatus,
        testingFrequency: "quarterly",
        createdAt: testDate,
        updatedAt: testDate,
        deletedAt: undefined,
        createdBy: MemberId.make("mem_test"),
        updatedBy: MemberId.make("mem_test"),
        deletedBy: undefined,
        hash: Hash.make("hash123"),
        orgId: OrgId.make("org_test"),
        workflowId: WorkflowId.make("wf_test"),
      });

      expect(asString(control.id)).toBe("ctr_test");
      expect(control.name).toBe("Access Control");
      expect(control.status).toBe("active");
    });
  });

  describe("CreateControl", () => {
    it("should have correct structure", () => {
      const input = {
        name: "Access Control",
        description: "Control access",
        frameworkId: FrameworkId.make("fwk_test"),
        status: "active" as ControlStatus,
        testingFrequency: "monthly",
      };

      const decoded = Schema.decodeUnknownSync(CreateControl)(input);
      expect(decoded.name).toBe("Access Control");
      expect(asString(decoded.frameworkId)).toBe("fwk_test");
    });
  });

  describe("ControlNotFoundError", () => {
    it("should create error with entity type", () => {
      const error = ControlNotFoundError.fromId(
        ControlId.make("ctr_123"),
      );
      expect(error.message).toBe("Control with id ctr_123 not found.");
      expect(error.entityType).toBe("Control");
    });
  });
});
