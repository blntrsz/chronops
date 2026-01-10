import { Client } from "@/lib/rpc";
import { Framework } from "@chronops/domain";

export const pageSize = 25;

export const frameworkListQuery = (page: number) =>
  Client.query(
    "FrameworkList",
    { page, size: pageSize },
    { reactivityKeys: { list: ["framework", page] } },
  );

export const frameworkByIdQuery = (id: Framework.FrameworkId) =>
  Client.query(
    "FrameworkById",
    { id },
    {
      reactivityKeys: { detail: ["framework", id] },
    },
  );

export const frameworkCountQuery = () =>
  Client.query("FrameworkCount", undefined, {
    reactivityKeys: { count: ["framework:count"] },
  });

export const frameworkCreateMutation = Client.mutation("FrameworkCreate");
export const frameworkUpdateMutation = Client.mutation("FrameworkUpdate");
export const frameworkRemoveMutation = Client.mutation("FrameworkRemove");
