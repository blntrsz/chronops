import { Client } from "@/lib/rpc-client";
import type { Control, Issue } from "@chronops/domain";

export const issueReactiveKeys = {
  all: ["issue"],
  detail: (id: Issue.IssueId) => [...issueReactiveKeys.all, "detail", id],
  details: () => [...issueReactiveKeys.all, "detail"],
  list: (page = 1, controlId?: Control.ControlId) => [
    ...issueReactiveKeys.all,
    "list",
    page,
    controlId,
  ],
  lists: () => [...issueReactiveKeys.all, "list"],
} as const;

export const listIssues = (page = 1, controlId?: Control.ControlId) =>
  Client.query(
    "IssueList",
    {
      page,
      size: 50,
      controlId,
    },
    {
      reactivityKeys: issueReactiveKeys.list(page, controlId),
    },
  );

export const getIssueById = (id: Issue.IssueId) =>
  Client.query(
    "IssueById",
    { id },
    {
      reactivityKeys: issueReactiveKeys.detail(id),
    },
  );

export const createIssue = () => Client.mutation("IssueCreate");
export const updateIssue = () => Client.mutation("IssueUpdate");
export const removeIssue = () => Client.mutation("IssueRemove");
