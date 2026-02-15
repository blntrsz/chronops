import { Client } from "@/lib/rpc-client";
import type { Control, Framework } from "@chronops/domain";

export const controlReactiveKeys = {
  all: ["control"],
  detail: (id: Control.ControlId) => [...controlReactiveKeys.all, "detail", id],
  details: () => [...controlReactiveKeys.all, "detail"],
  list: (page = 1) => [...controlReactiveKeys.all, "list", page],
  lists: () => [...controlReactiveKeys.all, "list"],
} as const;

export const listControls = (page = 1, frameworkId?: Framework.FrameworkId) =>
  Client.query(
    "ControlList",
    {
      page,
      size: 50,
      frameworkId,
    },
    {
      reactivityKeys: controlReactiveKeys.list(page),
    },
  );

export const getControlById = (id: Control.ControlId) =>
  Client.query(
    "ControlById",
    {
      id,
    },
    {
      reactivityKeys: controlReactiveKeys.detail(id),
    },
  );

export const createControl = () => Client.mutation("ControlCreate");
export const updateControl = () => Client.mutation("ControlUpdate");
export const removeControl = () => Client.mutation("ControlRemove");
