import { Client } from "@/lib/rpc-client";
import type { AssessmentTemplate, AssessmentInstance, Control } from "@chronops/domain";

export const assessmentTemplateKeys = {
  all: ["assessmentTemplate"],
  detail: (id: AssessmentTemplate.AssessmentTemplateId) =>
    [...assessmentTemplateKeys.all, "detail", id],
  list: (page = 1) => [...assessmentTemplateKeys.all, "list", page],
} as const;

export const assessmentInstanceKeys = {
  all: ["assessmentInstance"],
  detail: (id: AssessmentInstance.AssessmentInstanceId) =>
    [...assessmentInstanceKeys.all, "detail", id],
  list: (page = 1) => [...assessmentInstanceKeys.all, "list", page],
} as const;

export const listAssessmentTemplates = (page = 1, controlId?: Control.ControlId) =>
  Client.query(
    "AssessmentTemplateList",
    {
      page,
      size: 50,
      controlId,
    },
    {
      reactivityKeys: assessmentTemplateKeys.list(page),
    },
  );

export const getAssessmentTemplateById = (id: AssessmentTemplate.AssessmentTemplateId) =>
  Client.query(
    "AssessmentTemplateById",
    { id },
    {
      reactivityKeys: assessmentTemplateKeys.detail(id),
    },
  );

export const createAssessmentTemplate = () => Client.mutation("AssessmentTemplateCreate");
export const updateAssessmentTemplate = () => Client.mutation("AssessmentTemplateUpdate");
export const removeAssessmentTemplate = () => Client.mutation("AssessmentTemplateRemove");

export const listAssessmentInstances = (
  page = 1,
  filter?: {
    controlId?: Control.ControlId;
    templateId?: AssessmentTemplate.AssessmentTemplateId;
  },
) =>
  Client.query(
    "AssessmentInstanceList",
    {
      page,
      size: 50,
      controlId: filter?.controlId,
      templateId: filter?.templateId,
    },
    {
      reactivityKeys: assessmentInstanceKeys.list(page),
    },
  );

export const getAssessmentInstanceById = (id: AssessmentInstance.AssessmentInstanceId) =>
  Client.query(
    "AssessmentInstanceById",
    { id },
    {
      reactivityKeys: assessmentInstanceKeys.detail(id),
    },
  );

export const createAssessmentInstance = () => Client.mutation("AssessmentInstanceCreate");
export const updateAssessmentInstance = () => Client.mutation("AssessmentInstanceUpdate");
export const removeAssessmentInstance = () => Client.mutation("AssessmentInstanceRemove");
