import { Client } from "@/lib/rpc-client";
import type { QuestionerTemplate, QuestionerInstance } from "@chronops/domain";

export const questionerTemplateKeys = {
  all: ["questionerTemplate"],
  detail: (id: QuestionerTemplate.QuestionerTemplateId) => [
    ...questionerTemplateKeys.all,
    "detail",
    id,
  ],
  list: (page = 1) => [...questionerTemplateKeys.all, "list", page],
} as const;

export const questionerInstanceKeys = {
  all: ["questionerInstance"],
  detail: (id: QuestionerInstance.QuestionerInstanceId) => [
    ...questionerInstanceKeys.all,
    "detail",
    id,
  ],
  list: (page = 1) => [...questionerInstanceKeys.all, "list", page],
} as const;

export const listQuestionerTemplates = (page = 1) =>
  Client.query(
    "QuestionerTemplateList",
    {
      page,
      size: 50,
    },
    {
      reactivityKeys: questionerTemplateKeys.list(page),
    },
  );

export const getQuestionerTemplateById = (id: QuestionerTemplate.QuestionerTemplateId) =>
  Client.query(
    "QuestionerTemplateById",
    { id },
    {
      reactivityKeys: questionerTemplateKeys.detail(id),
    },
  );

export const createQuestionerTemplate = () => Client.mutation("QuestionerTemplateCreate");
export const updateQuestionerTemplate = () => Client.mutation("QuestionerTemplateUpdate");
export const removeQuestionerTemplate = () => Client.mutation("QuestionerTemplateRemove");

export const listQuestionerInstances = (
  page = 1,
  filter?: { templateId?: QuestionerTemplate.QuestionerTemplateId },
) =>
  Client.query(
    "QuestionerInstanceList",
    {
      page,
      size: 50,
      templateId: filter?.templateId,
    },
    {
      reactivityKeys: questionerInstanceKeys.list(page),
    },
  );

export const getQuestionerInstanceById = (id: QuestionerInstance.QuestionerInstanceId) =>
  Client.query(
    "QuestionerInstanceById",
    { id },
    {
      reactivityKeys: questionerInstanceKeys.detail(id),
    },
  );

export const createQuestionerInstance = () => Client.mutation("QuestionerInstanceCreate");
export const updateQuestionerInstance = () => Client.mutation("QuestionerInstanceUpdate");
export const removeQuestionerInstance = () => Client.mutation("QuestionerInstanceRemove");
export const submitQuestionerInstance = () => Client.mutation("QuestionerInstanceSubmit");
