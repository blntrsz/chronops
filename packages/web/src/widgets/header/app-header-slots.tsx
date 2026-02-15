"use client";

import * as React from "react";

type AppHeaderSlots = {
  left?: React.ReactNode;
  right?: React.ReactNode;
  breadcrumbLabel?: string;
};

type AppHeaderSlotsContextValue = AppHeaderSlots & {
  setLeft: (node?: React.ReactNode) => void;
  setRight: (node?: React.ReactNode) => void;
  setBreadcrumbLabel: (label?: string) => void;
  clear: () => void;
};

const AppHeaderSlotsContext = React.createContext<AppHeaderSlotsContextValue | null>(null);

export function AppHeaderSlotsProvider({ children }: { children: React.ReactNode }) {
  const [left, setLeft] = React.useState<React.ReactNode>();
  const [right, setRight] = React.useState<React.ReactNode>();
  const [breadcrumbLabel, setBreadcrumbLabel] = React.useState<string>();

  const clear = React.useCallback(() => {
    setLeft(undefined);
    setRight(undefined);
    setBreadcrumbLabel(undefined);
  }, []);

  const value = React.useMemo(
    () => ({ left, right, breadcrumbLabel, setLeft, setRight, setBreadcrumbLabel, clear }),
    [left, right, breadcrumbLabel, clear],
  );

  return <AppHeaderSlotsContext.Provider value={value}>{children}</AppHeaderSlotsContext.Provider>;
}

export function useAppHeaderSlotsState() {
  const ctx = React.useContext(AppHeaderSlotsContext);
  if (!ctx) {
    throw new Error("useAppHeaderSlotsState must be used within AppHeaderSlotsProvider");
  }
  return ctx;
}

export function useAppHeaderSlots(slots: AppHeaderSlots, deps: React.DependencyList = []) {
  const { setLeft, setRight, setBreadcrumbLabel } = useAppHeaderSlotsState();

  const hasLeft = Object.prototype.hasOwnProperty.call(slots, "left");
  const hasRight = Object.prototype.hasOwnProperty.call(slots, "right");
  const hasBreadcrumbLabel = Object.prototype.hasOwnProperty.call(slots, "breadcrumbLabel");

  React.useEffect(() => {
    if (hasLeft) setLeft(slots.left);
    if (hasRight) setRight(slots.right);
    if (hasBreadcrumbLabel) setBreadcrumbLabel(slots.breadcrumbLabel);
    return () => {
      if (hasLeft) setLeft(undefined);
      if (hasRight) setRight(undefined);
      if (hasBreadcrumbLabel) setBreadcrumbLabel(undefined);
    };
  }, [
    setLeft,
    setRight,
    setBreadcrumbLabel,
    hasLeft,
    hasRight,
    hasBreadcrumbLabel,
    slots.left,
    slots.right,
    slots.breadcrumbLabel,
    ...deps,
  ]);
}
