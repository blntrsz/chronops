import { Client } from "@/lib/rpc-client";
import { Document } from "@chronops/domain";

export const documentReactiveKeys = {
  all: ["document"],
  detail: (id: Document.DocumentId) => [
    ...documentReactiveKeys.all,
    "detail",
    id,
  ],
  details: () => [...documentReactiveKeys.all, "detail"],
  list: (page = 1) => [...documentReactiveKeys.all, "list", page],
  lists: () => [...documentReactiveKeys.all, "list"],
} as const;

export const listDocuments = (page = 1) =>
  Client.query(
    "DocumentList",
    {
      page,
      size: 50,
    },
    {
      reactivityKeys: documentReactiveKeys.list(page),
    },
  );

export const getDocumentById = (id: Document.DocumentId) =>
  Client.query(
    "DocumentById",
    {
      id,
    },
    {
      reactivityKeys: documentReactiveKeys.detail(id),
    },
  );

export const createDocument = () => Client.mutation("DocumentCreate");
export const updateDocument = () => Client.mutation("DocumentUpdate");
export const removeDocument = () => Client.mutation("DocumentRemove");

export const countDocuments = () =>
  Client.query("DocumentCount", undefined, {
    reactivityKeys: [...documentReactiveKeys.all, "count"],
  });
