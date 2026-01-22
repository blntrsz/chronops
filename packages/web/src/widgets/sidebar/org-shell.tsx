"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/widgets/header/app-header";
import { AppSidebar } from "@/widgets/sidebar/app-sidebar";
import type * as React from "react";

export function OrgShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader hasSidebar />
        <div className="p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
