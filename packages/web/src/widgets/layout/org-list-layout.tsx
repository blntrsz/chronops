"use client";

import * as React from "react";

type OrgListLayoutProps = {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function OrgListLayout({ title, action, children, className }: OrgListLayoutProps) {
  return (
    <div className={["flex flex-col gap-6", className].filter(Boolean).join(" ")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {action}
      </div>
      <div>{children}</div>
    </div>
  );
}
