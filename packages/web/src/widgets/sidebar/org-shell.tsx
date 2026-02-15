"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { AppHeader } from "@/widgets/header/app-header";
import { AppHeaderSlotsProvider, useAppHeaderSlotsState } from "@/widgets/header/app-header-slots";
import { AppSidebar } from "@/widgets/sidebar/app-sidebar";
import type * as React from "react";

function OrgShellContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { left, right, breadcrumbLabel } = useAppHeaderSlotsState();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader hasSidebar left={left} right={right} breadcrumbLabel={breadcrumbLabel} />
        <div className={cn("pt-4 px-4", className)}>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function OrgShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AppHeaderSlotsProvider>
      <OrgShellContent className={className}>{children}</OrgShellContent>
    </AppHeaderSlotsProvider>
  );
}
