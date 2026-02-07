import { Effect } from "effect";
import { describe } from "vitest";
import { expect, it } from "@effect/vitest";
import * as Workflow from "../workflow";

describe("Workflow engine", () => {
  const ReviewTemplate = Workflow.WorkflowTemplate.make({
    initial: "draft",
    transitions: {
      draft: { submit: "in_review" },
      in_review: { approve: "approved", reject: "rejected" },
      approved: {},
      rejected: { revise: "draft" },
    },
  });

  it.effect("runs a review workflow", () =>
    Effect.gen(function* () {
      const workflow = yield* Workflow.make(ReviewTemplate);
      expect(workflow.state).toBe("draft");

      const inReview = yield* Workflow.transition(workflow, "submit");
      expect(inReview.state).toBe("in_review");

      const approved = yield* Workflow.transition(inReview, "approve");
      expect(approved.state).toBe("approved");
    }),
  );

  it.effect("fails on invalid event", () =>
    Effect.gen(function* () {
      const workflow = yield* Workflow.make(ReviewTemplate, "in_review");
      const result = yield* Effect.either(Workflow.transition(workflow, "revise"));

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(Workflow.InvalidEvent);
      }
    }),
  );

  it.effect("persists and restores state", () =>
    Effect.gen(function* () {
      const workflow = yield* Workflow.make(ReviewTemplate);
      const inReview = yield* Workflow.transition(workflow, "submit");
      const persisted = inReview.state;

      const restored = yield* Workflow.make(ReviewTemplate, persisted);
      expect(restored.state).toBe("in_review");
      expect(restored.state).toBe(persisted);
    }),
  );

  it.effect("restore fails on invalid state", () =>
    Effect.gen(function* () {
      const result = yield* Effect.either(
        Workflow.make(ReviewTemplate, "unknown" as Workflow.StateOf<typeof ReviewTemplate>),
      );

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(Workflow.InvalidState);
      }
    }),
  );
});
