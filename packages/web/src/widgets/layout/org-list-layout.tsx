"use client";

import * as React from "react";

type OrgListLayoutProps = {
  title: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function OrgListLayout({ title, action, children, className }: OrgListLayoutProps) {
  return (
    <div className={["flex flex-col gap-6", className].filter(Boolean).join(" ")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {typeof title === "string" ? (
          <h1 className="text-2xl font-semibold">{title}</h1>
        ) : (
          <div className="min-w-0">{title}</div>
        )}
        {action}
      </div>
      <div>{children}</div>
    </div>
  );
}
