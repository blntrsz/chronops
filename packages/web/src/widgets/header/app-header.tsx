"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link, useParams, useRouterState } from "@tanstack/react-router";
import type * as React from "react";

import { cn } from "@/lib/utils";

type AppHeaderProps = {
  hasSidebar?: boolean;
  className?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  breadcrumbLabel?: string;
};

const SECTION_LABEL: Record<string, string> = {
  framework: "Frameworks",
  control: "Controls",
  assessment: "Assessments",
  "assessment-instance": "Assessment Instances",
};

export function AppHeader({ hasSidebar, className, left, right, breadcrumbLabel }: AppHeaderProps) {
  const { slug } = useParams({ from: "/org/$slug" });
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const rest = pathname.replace(new RegExp(`^/org/${slug}(/)?`), "");
  const [section, maybeId] = rest.split("/").filter(Boolean);
  const sectionLabel = section ? (SECTION_LABEL[section] ?? section) : undefined;

  const showSection = Boolean(sectionLabel);
  const showId = Boolean(maybeId);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
    >
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-2">
          {hasSidebar && (
            <>
              <SidebarTrigger className="h-8 w-8" />
              <Separator className="mx-1 h-6" orientation="vertical" />
            </>
          )}

          {left ?? (
            <div className="flex min-w-0 items-center gap-2">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/org/$slug" params={{ slug }}>
                        {slug}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>

                  {showSection && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {showId ? (
                          <BreadcrumbLink asChild>
                            <Link to="/org/$slug" params={{ slug }}>
                              {sectionLabel}
                            </Link>
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage className="truncate">{sectionLabel}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                    </>
                  )}

                  {showId && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="truncate">
                          {breadcrumbLabel ?? maybeId}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">{right}</div>
      </div>
    </header>
  );
}
