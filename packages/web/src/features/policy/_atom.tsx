import { Client } from "@/lib/rpc-client";
import type { Control, Policy } from "@chronops/domain";

export const policyReactiveKeys = {
  all: ["policy"],
  detail: (id: Policy.PolicyId) => [...policyReactiveKeys.all, "detail", id],
  details: () => [...policyReactiveKeys.all, "detail"],
  list: (page = 1, controlId?: Control.ControlId) => [
    ...policyReactiveKeys.all,
    "list",
    page,
    controlId,
  ],
  lists: () => [...policyReactiveKeys.all, "list"],
} as const;

export const listPolicies = (page = 1, controlId?: Control.ControlId) =>
  Client.query(
    "PolicyList",
    {
      page,
      size: 50,
      controlId,
    },
    {
      reactivityKeys: policyReactiveKeys.list(page, controlId),
    },
  );

export const getPolicyById = (id: Policy.PolicyId) =>
  Client.query(
    "PolicyById",
    { id },
    {
      reactivityKeys: policyReactiveKeys.detail(id),
    },
  );

export const createPolicy = () => Client.mutation("PolicyCreate");
export const updatePolicy = () => Client.mutation("PolicyUpdate");
export const removePolicy = () => Client.mutation("PolicyRemove");
