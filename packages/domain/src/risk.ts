import { Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Base from "./base";
import * as Control from "./control";
import * as Workflow from "./workflow";

export const RiskId = Schema.String.pipe(Schema.brand("RiskId"));
export type RiskId = typeof RiskId.Type;

export const riskId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;
  return RiskId.make(Base.buildId("rsk", createId));
});

export const RiskStatus = Schema.Union(
  Schema.Literal("open"),
  Schema.Literal("mitigated"),
  Schema.Literal("accepted"),
  Schema.Literal("closed"),
);
export type RiskStatus = typeof RiskStatus.Type;

export const RiskLikelihood = Schema.Union(
  Schema.Literal("low"),
  Schema.Literal("medium"),
  Schema.Literal("high"),
);
export type RiskLikelihood = typeof RiskLikelihood.Type;

export const RiskImpact = Schema.Union(
  Schema.Literal("low"),
  Schema.Literal("medium"),
  Schema.Literal("high"),
);
export type RiskImpact = typeof RiskImpact.Type;

export const RiskScore = Schema.Number.pipe(Schema.int(), Schema.greaterThanOrEqualTo(0));
export type RiskScore = typeof RiskScore.Type;

export const RiskTreatment = Schema.Union(
  Schema.Literal("accept"),
  Schema.Literal("mitigate"),
  Schema.Literal("transfer"),
  Schema.Literal("avoid"),
);
export type RiskTreatment = typeof RiskTreatment.Type;

export class Risk extends Base.Base.extend<Risk>("Risk")({
  id: RiskId,
  title: Schema.String,
  description: Schema.NullOr(Schema.String),
  status: RiskStatus,
  likelihood: RiskLikelihood,
  impact: RiskImpact,
  score: Schema.NullOr(RiskScore),
  treatment: Schema.NullOr(RiskTreatment),
  controlId: Schema.NullOr(Control.ControlId),
}) {}

export const CreateRisk = Risk.pipe(
  Schema.pick("title", "description", "likelihood", "impact", "score", "treatment", "controlId"),
);
export type CreateRisk = typeof CreateRisk.Type;

export const UpdateRisk = Risk.pipe(
  Schema.pick(
    "title",
    "description",
    "status",
    "likelihood",
    "impact",
    "score",
    "treatment",
    "controlId",
  ),
  Schema.partial,
);
export type UpdateRisk = typeof UpdateRisk.Type;

export const RiskTemplate = Workflow.WorkflowTemplate.make({
  initial: "open",
  transitions: {
    open: { mitigate: "mitigated", accept: "accepted", close: "closed" },
    mitigated: { reopen: "open", accept: "accepted", close: "closed" },
    accepted: { reopen: "open", mitigate: "mitigated", close: "closed" },
    closed: { reopen: "open" },
  },
});

export type RiskEvent = Workflow.EventOf<typeof RiskTemplate>;

export const make = Effect.fn(function* (input: CreateRisk) {
  const base = yield* Base.makeBase();

  return Risk.make({
    id: yield* riskId(),
    status: "open",
    ...input,
    ...base,
  });
});

export const update = Effect.fn(function* (model: Risk, input: UpdateRisk) {
  const base = yield* Base.updateBase();

  return Risk.make({
    ...model,
    ...input,
    ...base,
  });
});

export const remove = Effect.fn(function* (model: Risk) {
  const base = yield* Base.removeBase();

  return Risk.make({
    ...model,
    ...base,
  });
});

export class RiskNotFoundError extends Base.NotFoundError {
  static override fromId(id: RiskId) {
    return new RiskNotFoundError({
      message: `Risk with id ${id} not found.`,
      entityType: "Risk",
      entityId: id,
    });
  }
}
