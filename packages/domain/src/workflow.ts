import { Effect } from "effect";
import type { ParseError } from "effect/ParseResult";
import * as Schema from "effect/Schema";

export type TransitionMap<TState extends string = string, TEvent extends string = string> = Record<
  TState,
  Partial<Record<TEvent, TState>>
>;

export type StateOf<TWorkflow extends { transitions: TransitionMap }> = Extract<
  keyof TWorkflow["transitions"],
  string
>;

export type EventOf<TWorkflow extends { transitions: TransitionMap }> = Extract<
  {
    [State in keyof TWorkflow["transitions"]]: keyof TWorkflow["transitions"][State];
  }[keyof TWorkflow["transitions"]],
  string
>;

export class InvalidState extends Schema.TaggedError<InvalidState>("InvalidState")(
  "InvalidState",
  {
    message: Schema.String,
    state: Schema.String,
  },
) {}

export class InvalidTemplate extends Schema.TaggedError<InvalidTemplate>("InvalidTemplate")(
  "InvalidTemplate",
  {
    message: Schema.String,
    state: Schema.optional(Schema.String),
  },
) {}

export class InvalidEvent extends Schema.TaggedError<InvalidEvent>("InvalidEvent")(
  "InvalidEvent",
  {
    message: Schema.String,
    state: Schema.String,
    event: Schema.String,
  },
) {}

const LowerSnakeCase = Schema.String.pipe(
  Schema.pattern(/^[a-z0-9]+(?:_[a-z0-9]+)*$/),
);

export class WorkflowTemplate extends Schema.Class<WorkflowTemplate>("WorkflowTemplate")({
  initial: LowerSnakeCase,
  transitions: Schema.Record({
    key: LowerSnakeCase,
    value: Schema.Record({ key: LowerSnakeCase, value: LowerSnakeCase }),
  }),
}) {}

export type State = StateOf<WorkflowTemplate>;
export type Event = EventOf<WorkflowTemplate>;

export class Workflow extends Schema.Class<Workflow>("Workflow")({
  template: WorkflowTemplate,
  state: LowerSnakeCase,
}) {}

const isState = Effect.fn(function* (workflow: WorkflowTemplate, state: string) {
  return Object.prototype.hasOwnProperty.call(workflow.transitions, state);
});

export const hasState = Effect.fn(function* (workflowTemplate: WorkflowTemplate, state: string) {
  return yield* isState(workflowTemplate, state);
});

const isEvent = Effect.fn(function* (workflow: WorkflowTemplate, state: string, event: string) {
  return workflow.transitions[state]?.[event] !== undefined;
});

const validateTemplate = Effect.fn(function* (workflowTemplate: WorkflowTemplate) {
  const states = Object.keys(workflowTemplate.transitions);
  const initialValid = yield* hasState(workflowTemplate, workflowTemplate.initial);
  if (!initialValid) {
    return yield* Effect.fail(
      new InvalidTemplate({
        message: `Initial state missing: ${workflowTemplate.initial}`,
        state: workflowTemplate.initial,
      }),
    );
  }

  for (const state of states) {
    const transitions = workflowTemplate.transitions[state] ?? {};
    for (const next of Object.values(transitions)) {
      const nextValid = yield* hasState(workflowTemplate, next);
      if (!nextValid) {
        return yield* Effect.fail(
          new InvalidTemplate({
            message: `Transition target missing: ${next}`,
            state: next,
          }),
        );
      }
    }
  }
});

export const make = Effect.fn(function* <
  TWorkflow extends WorkflowTemplate,
  TState extends StateOf<TWorkflow>,
>(
  workflowTemplate: TWorkflow,
  state?: TState,
): Effect.Effect<Workflow, InvalidState | InvalidTemplate | ParseError> {
  const parsedTemplate = yield* Schema.decodeUnknown(WorkflowTemplate)(workflowTemplate);
  yield* validateTemplate(parsedTemplate);

  const resolved = (state ?? parsedTemplate.initial) as string;
  const valid = yield* isState(parsedTemplate, resolved);
  if (!valid) {
    return yield* Effect.fail(
      new InvalidState({
        message: `Invalid workflow state: ${resolved}`,
        state: resolved,
      }),
    );
  }

  return Workflow.make({ template: parsedTemplate, state: resolved }) as Workflow;
});

export const transition = Effect.fn(function* <
  TWorkflow extends Workflow,
  TState extends StateOf<TWorkflow["template"]>,
  TEvent extends EventOf<TWorkflow["template"]>,
>(
  workflow: TWorkflow,
  event: TEvent,
): Effect.Effect<Workflow, InvalidEvent | InvalidTemplate | ParseError> {
  const parsed = yield* Schema.decodeUnknown(Workflow)(workflow);
  const template = parsed.template;
  yield* validateTemplate(template);
  const current = parsed.state;
  const valid = yield* isEvent(template, current, event as string);
  if (!valid) {
    return yield* Effect.fail(
      new InvalidEvent({
        message: `Invalid workflow event: ${event}`,
        state: current,
        event: event as string,
      }),
    );
  }

  const next = template.transitions[current]?.[event as string];
  if (!next) {
    return yield* Effect.fail(
      new InvalidEvent({
        message: `Invalid workflow event: ${event}`,
        state: current,
        event: event as string,
      }),
    );
  }

  return Workflow.make({ template, state: next }) as Workflow;
});
