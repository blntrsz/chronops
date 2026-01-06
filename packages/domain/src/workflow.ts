import { Effect, Option } from "effect";
import * as Schema from "effect/Schema";

import * as Base from "./base";

// --- Id ---

export const WorkflowId = Base.WorkflowId;
export type WorkflowId = typeof WorkflowId.Type;

export const workflowId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;

  return WorkflowId.make(`wfl_${createId()}`);
});

// --- Template ---

export const WorkflowEntityType = Schema.Union(
  Schema.Literal("framework"),
  Schema.Literal("control"),
  Schema.Literal("document"),
);
export type WorkflowEntityType = typeof WorkflowEntityType.Type;

export const WorkflowStatus = Schema.Union(
  Schema.Literal("draft"),
  Schema.Literal("under_review"),
  Schema.Literal("uploaded"),
  Schema.Literal("approved"),
  Schema.Literal("active"),
  Schema.Literal("archived"),
  Schema.Literal("deprecated"),
);
export type WorkflowStatus = typeof WorkflowStatus.Type;

export const WorkflowEvent = Schema.String.pipe(Schema.brand("WorkflowEvent"));
export type WorkflowEvent = typeof WorkflowEvent.Type;

export interface WorkflowTemplate {
  entityType: WorkflowEntityType;
  initial: WorkflowStatus;
  transitions: Record<string, Record<string, WorkflowStatus>>;
}

export const FrameworkWorkflow = {
  entityType: "framework",
  initial: "draft",
  transitions: {
    draft: { ACTIVATE: "active", ARCHIVE: "archived" },
    active: { ARCHIVE: "archived" },
    archived: {},
  },
} as const satisfies WorkflowTemplate;

export const ControlWorkflow = {
  entityType: "control",
  initial: "draft",
  transitions: {
    draft: { SUBMIT: "under_review" },
    under_review: { APPROVE: "approved", REJECT: "draft" },
    approved: { DEPRECATE: "deprecated" },
    deprecated: {},
  },
} as const satisfies WorkflowTemplate;

export const DocumentWorkflow = {
  entityType: "document",
  initial: "draft",
  transitions: {
    draft: { UPLOAD: "uploaded" },
    uploaded: { APPROVE: "approved", REJECT: "draft" },
    approved: { ARCHIVE: "archived" },
    archived: {},
  },
} as const satisfies WorkflowTemplate;

export const templateForEntity = (entityType: WorkflowEntityType): WorkflowTemplate => {
  switch (entityType) {
    case "framework":
      return FrameworkWorkflow;
    case "control":
      return ControlWorkflow;
    case "document":
      return DocumentWorkflow;
  }
};

// --- Model ---

export class Workflow extends Base.Base.extend<Workflow>("Workflow")({
  id: WorkflowId,
  entityType: WorkflowEntityType,
  status: WorkflowStatus,
}) {}

export const CreateWorkflow = Workflow.pipe(Schema.pick("entityType"));
export type CreateWorkflow = typeof CreateWorkflow.Type;

export const UpdateWorkflow = Workflow.pipe(Schema.pick("status"));
export type UpdateWorkflow = typeof UpdateWorkflow.Type;

// --- Operations ---

export const make = Effect.fn(function* (input: CreateWorkflow) {
  const id = yield* workflowId();
  const template = templateForEntity(input.entityType);
  const base = yield* Base.make({ workflowId: id });

  return Workflow.make({
    id,
    status: template.initial,
    ...input,
    ...base,
  });
});

export const updateStatus = Effect.fn(function* (model: Workflow, status: WorkflowStatus) {
  const base = yield* Base.update();

  return Workflow.make({
    ...model,
    status,
    ...base,
  });
});

export class WorkflowNotFoundError extends Schema.TaggedError<WorkflowNotFoundError>(
  "WorkflowNotFoundError",
)("WorkflowNotFoundError", {
  message: Schema.String,
}) {
  static fromId(id: WorkflowId) {
    return new WorkflowNotFoundError({
      message: `Workflow with id ${id} not found`,
    });
  }
}

export class WorkflowInvalidTransitionError extends Schema.TaggedError<WorkflowInvalidTransitionError>(
  "WorkflowInvalidTransitionError",
)("WorkflowInvalidTransitionError", {
  entityType: WorkflowEntityType,
  from: WorkflowStatus,
  event: Schema.String,
  message: Schema.String,
}) {
  static from(input: {
    entityType: WorkflowEntityType;
    from: WorkflowStatus;
    event: string;
  }) {
    return new WorkflowInvalidTransitionError({
      ...input,
      message: `${input.entityType}:${input.from} cannot ${input.event}`,
    });
  }
}

export const transition = (
  template: WorkflowTemplate,
  from: WorkflowStatus,
  event: string,
): Option.Option<WorkflowStatus> => {
  const stateTransitions = template.transitions[from];
  if (stateTransitions === undefined) {
    return Option.none();
  }

  return Option.fromNullable(stateTransitions[event]);
};

export const canTransition = (
  template: WorkflowTemplate,
  from: WorkflowStatus,
  event: string,
) => Option.isSome(transition(template, from, event));
