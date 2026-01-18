import { Client } from "@/lib/rpc-client";
import type { Control } from "@chronops/domain";

export const controlReactiveKeys = {
  all: ["control"],
  detail: (id: Control.ControlId) => [...controlReactiveKeys.all, "detail", id],
  details: () => [...controlReactiveKeys.all, "detail"],
  list: (page = 1) => [...controlReactiveKeys.all, "list", page],
  lists: () => [...controlReactiveKeys.all, "list"],
} as const;

export const listControls = (page = 1) =>
  Client.query(
    "ControlList",
    {
      page,
      size: 50,
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

export const countControls = () =>
  Client.query("ControlCount", undefined, {
    reactivityKeys: [...controlReactiveKeys.all, "count"],
  });
