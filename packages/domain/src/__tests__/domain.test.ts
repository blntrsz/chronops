import { describe, expect, it } from "bun:test";
import { DateTime, Schema } from "effect";
import { MemberId, OrgId } from "../actor";
import { Base, Hash, NotFoundError } from "../base";
import {
  Control,
  ControlId,
  ControlNotFoundError,
  type ControlStatus,
  CreateControl,
} from "../control";
import {
  CreateFramework,
  Framework,
  FrameworkId,
  FrameworkNotFoundError,
  UpdateFramework,
} from "../framework";
import {
  Answer,
  CreateQuestionnaire,
  Question,
  type QuestionType,
  QuestionerId,
  Questionnaire,
  QuestionnaireNotFoundError,
  type QuestionnaireStatus,
  type QuestionnaireType,
} from "../questioner";

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
        deletedAt: null,
        createdBy: MemberId.make("mem_test"),
        updatedBy: MemberId.make("mem_test"),
        deletedBy: null,
        hash: Hash.make("hash123"),
        orgId: OrgId.make("org_test"),
      });

      expect(base.createdAt).toEqual(testDate);
      expect(base.updatedAt).toEqual(testDate);
      expect(asString(base.orgId)).toBe("org_test");
    });
  });

  describe("CreateFramework", () => {
    it("should have correct structure", () => {
      const input = {
        name: "GDPR",
        description: "Data Protection",
        version: "2024",
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
      const error = FrameworkNotFoundError.fromId(FrameworkId.make("fwk_123"));
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

    it("should accept under_review status", () => {
      const status: ControlStatus = "under_review";
      expect(status).toBe("under_review");
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
        status: "approved" as ControlStatus,
        testingFrequency: "quarterly",
        createdAt: testDate,
        updatedAt: testDate,
        deletedAt: null,
        createdBy: MemberId.make("mem_test"),
        updatedBy: MemberId.make("mem_test"),
        deletedBy: null,
        hash: Hash.make("hash123"),
        orgId: OrgId.make("org_test"),
      });

      expect(asString(control.id)).toBe("ctr_test");
      expect(control.name).toBe("Access Control");
      expect(control.status).toBe("approved");
    });
  });

  describe("CreateControl", () => {
    it("should have correct structure", () => {
      const input = {
        name: "Access Control",
        description: "Control access",
        frameworkId: FrameworkId.make("fwk_test"),
        testingFrequency: "monthly",
      };

      const decoded = Schema.decodeUnknownSync(CreateControl)(input);
      expect(decoded.name).toBe("Access Control");
      expect(asString(decoded.frameworkId)).toBe("fwk_test");
    });
  });

  describe("ControlNotFoundError", () => {
    it("should create error with entity type", () => {
      const error = ControlNotFoundError.fromId(ControlId.make("ctr_123"));
      expect(error.message).toBe("Control with id ctr_123 not found.");
      expect(error.entityType).toBe("Control");
    });
  });
});

describe("Questioner Domain", () => {
  describe("QuestionerId", () => {
    it("should create a valid QuestionerId", () => {
      const id = QuestionerId.make("qst_test");
      expect(asString(id)).toBe("qst_test");
    });
  });

  describe("QuestionnaireStatus", () => {
    it("should accept draft status", () => {
      const status: QuestionnaireStatus = "draft";
      expect(status).toBe("draft");
    });

    it("should accept submitted status", () => {
      const status: QuestionnaireStatus = "submitted";
      expect(status).toBe("submitted");
    });

    it("should accept reviewed status", () => {
      const status: QuestionnaireStatus = "reviewed";
      expect(status).toBe("reviewed");
    });
  });

  describe("QuestionnaireType", () => {
    it("should accept control_test type", () => {
      const type: QuestionnaireType = "control_test";
      expect(type).toBe("control_test");
    });

    it("should accept risk_assessment type", () => {
      const type: QuestionnaireType = "risk_assessment";
      expect(type).toBe("risk_assessment");
    });
  });

  describe("QuestionType", () => {
    it("should accept text type", () => {
      const type: QuestionType = "text";
      expect(type).toBe("text");
    });

    it("should accept multiple_choice type", () => {
      const type: QuestionType = "multiple_choice";
      expect(type).toBe("multiple_choice");
    });
  });

  describe("Question Schema", () => {
    it("should create a valid Question", () => {
      const question = Question.make({
        id: "q1",
        text: "Is control effective?",
        type: "boolean" as QuestionType,
        required: true,
        options: null,
      });

      expect(question.id).toBe("q1");
      expect(question.text).toBe("Is control effective?");
      expect(question.type).toBe("boolean");
      expect(question.required).toBe(true);
    });

    it("should create Question with options", () => {
      const question = Question.make({
        id: "q2",
        text: "Select severity",
        type: "multiple_choice" as QuestionType,
        required: true,
        options: ["Low", "Medium", "High"],
      });

      expect(question.options).toEqual(["Low", "Medium", "High"]);
    });
  });

  describe("Answer Schema", () => {
    it("should create a valid Answer", () => {
      const testDate = dt("2024-01-01T00:00:00Z");
      const answer = Answer.make({
        questionId: "q1",
        value: "yes",
        answeredAt: testDate,
        answeredBy: MemberId.make("mem_test"),
      });

      expect(answer.questionId).toBe("q1");
      expect(answer.value).toBe("yes");
      expect(asString(answer.answeredBy)).toBe("mem_test");
    });
  });

  describe("Questionnaire Schema", () => {
    it("should create a valid Questionnaire", () => {
      const testDate = dt("2024-01-01T00:00:00Z");
      const question = Question.make({
        id: "q1",
        text: "Test question",
        type: "text" as QuestionType,
        required: true,
        options: null,
      });

      const questionnaire = Questionnaire.make({
        id: QuestionerId.make("qst_test"),
        name: "Control Test Q1 2024",
        description: "Quarterly control testing",
        type: "control_test" as QuestionnaireType,
        status: "draft" as QuestionnaireStatus,
        frameworkId: FrameworkId.make("fwk_test"),
        controlId: ControlId.make("ctr_test"),
        questions: [question],
        answers: [],
        dueDate: testDate,
        completedAt: null,
        createdAt: testDate,
        updatedAt: testDate,
        deletedAt: null,
        createdBy: MemberId.make("mem_test"),
        updatedBy: MemberId.make("mem_test"),
        deletedBy: null,
        hash: Hash.make("hash123"),
        orgId: OrgId.make("org_test"),
      });

      expect(asString(questionnaire.id)).toBe("qst_test");
      expect(questionnaire.name).toBe("Control Test Q1 2024");
      expect(questionnaire.type).toBe("control_test");
      expect(questionnaire.status).toBe("draft");
      expect(questionnaire.questions).toHaveLength(1);
    });
  });

  describe("CreateQuestionnaire", () => {
    it("should have correct structure", () => {
      const question = Question.make({
        id: "q1",
        text: "Test",
        type: "text" as QuestionType,
        required: true,
        options: null,
      });

      const input = {
        name: "Test Questionnaire",
        description: "Testing control",
        type: "control_test" as QuestionnaireType,
        frameworkId: FrameworkId.make("fwk_test"),
        controlId: ControlId.make("ctr_test"),
        questions: [question],
        dueDate: null,
      };

      const decoded = Schema.decodeUnknownSync(CreateQuestionnaire)(input);
      expect(decoded.name).toBe("Test Questionnaire");
      expect(decoded.type).toBe("control_test");
    });
  });

  describe("QuestionnaireNotFoundError", () => {
    it("should create error with entity type", () => {
      const error = QuestionnaireNotFoundError.fromId(QuestionerId.make("qst_123"));
      expect(error.message).toBe("Questionnaire with id qst_123 not found.");
      expect(error.entityType).toBe("Questionnaire");
    });
  });
});
