import { Client } from "@/lib/rpc-client";
import type { Framework } from "@chronops/domain";

export const frameworkReactiveKeys = {
  all: ["framework"],
  detail: (id: Framework.FrameworkId) => [...frameworkReactiveKeys.all, "detail", id],
  details: () => [...frameworkReactiveKeys.all, "detail"],
  list: (page = 1) => [...frameworkReactiveKeys.all, "list", page],
  lists: () => [...frameworkReactiveKeys.all, "list"],
} as const;

export const listFrameworks = (page = 1) =>
  Client.query(
    "FrameworkList",
    {
      page,
      size: 50,
    },
    {
      reactivityKeys: frameworkReactiveKeys.list(page),
    },
  );

export const getFrameworkById = (id: Framework.FrameworkId) =>
  Client.query(
    "FrameworkById",
    {
      id,
    },
    {
      reactivityKeys: frameworkReactiveKeys.detail(id),
    },
  );

export const createFramework = () => Client.mutation("FrameworkCreate");
export const updateFramework = () => Client.mutation("FrameworkUpdate");
export const removeFramework = () => Client.mutation("FrameworkRemove");

export const countFrameworks = () =>
  Client.query(
    "FrameworkList",
    { page: 1, size: 1 },
    {
      reactivityKeys: [...frameworkReactiveKeys.all, "count"],
    },
  );

export const listFrameworkSummaries = () =>
  Client.query(
    "FrameworkSummaryList",
    {},
    {
      reactivityKeys: [...frameworkReactiveKeys.all, "summaries"],
    },
  );
