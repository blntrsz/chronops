import { Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Base from "./base";
import * as Control from "./control";
import * as Workflow from "./workflow";

export const AssessmentTemplateId = Schema.String.pipe(Schema.brand("AssessmentTemplateId"));
export type AssessmentTemplateId = typeof AssessmentTemplateId.Type;

export const AssessmentWorkflowStatus = Schema.Union(
  Schema.Literal("draft"),
  Schema.Literal("active"),
  Schema.Literal("archived"),
);
export type AssessmentWorkflowStatus = typeof AssessmentWorkflowStatus.Type;

export const AssessmentTemplateWorkflow = Workflow.WorkflowTemplate.make({
  initial: "draft",
  transitions: {
    draft: { activate: "active", archive: "archived" },
    active: { archive: "archived" },
    archived: {},
  },
});

export const Event = {
  created: "assessment-template.created",
  updated: "assessment-template.updated",
  deleted: "assessment-template.deleted",
} as const;

export type AssessmentTemplateEvent = Workflow.EventOf<typeof AssessmentTemplateWorkflow>;

export const assessmentTemplateId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return AssessmentTemplateId.make(Base.buildId("ast", createId));
});

export class AssessmentTemplate extends Base.Base.extend<AssessmentTemplate>("AssessmentTemplate")({
  id: AssessmentTemplateId,
  ticket: Base.Ticket,
  controlId: Control.ControlId,
  name: Schema.String,
  description: Schema.NullOr(Schema.String),
  status: AssessmentWorkflowStatus,
}) {}

export const CreateAssessmentTemplate = AssessmentTemplate.pipe(
  Schema.pick("controlId", "name", "description"),
);
export type CreateAssessmentTemplate = typeof CreateAssessmentTemplate.Type;

export type CreateAssessmentTemplateInput = CreateAssessmentTemplate & { ticket: Base.Ticket };

export const UpdateAssessmentTemplate = AssessmentTemplate.pipe(
  Schema.pick("name", "description", "status"),
  Schema.partial,
);
export type UpdateAssessmentTemplate = typeof UpdateAssessmentTemplate.Type;

export const make = Effect.fn(function* (input: CreateAssessmentTemplateInput) {
  const base = yield* Base.makeBase();

  return AssessmentTemplate.make({
    id: yield* assessmentTemplateId(),
    status: "draft",
    ...input,
    ...base,
  });
});

export const update = Effect.fn(function* (
  model: AssessmentTemplate,
  input: UpdateAssessmentTemplate,
) {
  const base = yield* Base.updateBase();

  return AssessmentTemplate.make({
    ...model,
    ...input,
    ...base,
  });
});

export const remove = Effect.fn(function* (model: AssessmentTemplate) {
  const base = yield* Base.removeBase();

  return AssessmentTemplate.make({
    ...model,
    ...base,
  });
});

export class AssessmentTemplateNotFoundError extends Base.NotFoundError {
  static override fromId(id: AssessmentTemplateId) {
    return new AssessmentTemplateNotFoundError({
      message: `Assessment template with id ${id} not found.`,
      entityType: "AssessmentTemplate",
      entityId: id,
    });
  }
}
