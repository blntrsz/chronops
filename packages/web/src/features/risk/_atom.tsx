import { Client } from "@/lib/rpc-client";
import type { Control, Risk } from "@chronops/domain";

export const riskReactiveKeys = {
  all: ["risk"],
  detail: (id: Risk.RiskId) => [...riskReactiveKeys.all, "detail", id],
  details: () => [...riskReactiveKeys.all, "detail"],
  list: (
    page = 1,
    filter?: {
      controlId?: Control.ControlId;
      status?: Risk.RiskStatus;
      likelihood?: Risk.RiskLikelihood;
      impact?: Risk.RiskImpact;
      treatment?: Risk.RiskTreatment;
    },
  ) => [...riskReactiveKeys.all, "list", page, filter],
  lists: () => [...riskReactiveKeys.all, "list"],
} as const;

export const listRisks = (
  page = 1,
  filter?: {
    controlId?: Control.ControlId;
    status?: Risk.RiskStatus;
    likelihood?: Risk.RiskLikelihood;
    impact?: Risk.RiskImpact;
    treatment?: Risk.RiskTreatment;
  },
) =>
  Client.query(
    "RiskList",
    {
      page,
      size: 50,
      controlId: filter?.controlId,
      status: filter?.status,
      likelihood: filter?.likelihood,
      impact: filter?.impact,
      treatment: filter?.treatment,
    },
    {
      reactivityKeys: riskReactiveKeys.list(page, filter),
    },
  );

export const getRiskById = (id: Risk.RiskId) =>
  Client.query(
    "RiskById",
    { id },
    {
      reactivityKeys: riskReactiveKeys.detail(id),
    },
  );

export const createRisk = () => Client.mutation("RiskCreate");
export const updateRisk = () => Client.mutation("RiskUpdate");
export const removeRisk = () => Client.mutation("RiskRemove");
