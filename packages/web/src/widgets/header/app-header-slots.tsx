"use client";

import * as React from "react";

type AppHeaderSlots = {
  left?: React.ReactNode;
  right?: React.ReactNode;
};

type AppHeaderSlotsContextValue = AppHeaderSlots & {
  setLeft: (node?: React.ReactNode) => void;
  setRight: (node?: React.ReactNode) => void;
  clear: () => void;
};

const AppHeaderSlotsContext = React.createContext<AppHeaderSlotsContextValue | null>(null);

export function AppHeaderSlotsProvider({ children }: { children: React.ReactNode }) {
  const [left, setLeft] = React.useState<React.ReactNode>();
  const [right, setRight] = React.useState<React.ReactNode>();

  const clear = React.useCallback(() => {
    setLeft(undefined);
    setRight(undefined);
  }, []);

  const value = React.useMemo(
    () => ({ left, right, setLeft, setRight, clear }),
    [left, right, clear],
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
  const { setLeft, setRight } = useAppHeaderSlotsState();

  const hasLeft = Object.prototype.hasOwnProperty.call(slots, "left");
  const hasRight = Object.prototype.hasOwnProperty.call(slots, "right");

  React.useEffect(() => {
    if (hasLeft) setLeft(slots.left);
    if (hasRight) setRight(slots.right);
    return () => {
      if (hasLeft) setLeft(undefined);
      if (hasRight) setRight(undefined);
    };
  }, [setLeft, setRight, hasLeft, hasRight, slots.left, slots.right, ...deps]);
}
