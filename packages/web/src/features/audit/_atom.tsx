import { Client } from "@/lib/rpc-client";
import type { AssessmentTemplate, Audit } from "@chronops/domain";

export const auditReactiveKeys = {
  all: ["audit"],
  detail: (id: Audit.AuditId) => [...auditReactiveKeys.all, "detail", id],
  details: () => [...auditReactiveKeys.all, "detail"],
  list: (page = 1, assessmentMethodId?: AssessmentTemplate.AssessmentTemplateId) => [
    ...auditReactiveKeys.all,
    "list",
    page,
    assessmentMethodId,
  ],
  lists: () => [...auditReactiveKeys.all, "list"],
} as const;

export const listAudits = (
  page = 1,
  assessmentMethodId?: AssessmentTemplate.AssessmentTemplateId,
) =>
  Client.query(
    "AuditList",
    {
      page,
      size: 50,
      assessmentMethodId,
    },
    {
      reactivityKeys: auditReactiveKeys.list(page, assessmentMethodId),
    },
  );

export const getAuditById = (id: Audit.AuditId) =>
  Client.query(
    "AuditById",
    { id },
    {
      reactivityKeys: auditReactiveKeys.detail(id),
    },
  );

export const createAudit = () => Client.mutation("AuditCreate");
export const updateAudit = () => Client.mutation("AuditUpdate");
export const removeAudit = () => Client.mutation("AuditRemove");
