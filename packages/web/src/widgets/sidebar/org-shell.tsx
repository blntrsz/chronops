"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/widgets/header/app-header";
import { AppHeaderSlotsProvider, useAppHeaderSlotsState } from "@/widgets/header/app-header-slots";
import { AppSidebar } from "@/widgets/sidebar/app-sidebar";
import type * as React from "react";

function OrgShellContent({ children }: { children: React.ReactNode }) {
  const { left, right } = useAppHeaderSlotsState();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader hasSidebar left={left} right={right} />
        <div className="p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function OrgShell({ children }: { children: React.ReactNode }) {
  return (
    <AppHeaderSlotsProvider>
      <OrgShellContent>{children}</OrgShellContent>
    </AppHeaderSlotsProvider>
  );
}
