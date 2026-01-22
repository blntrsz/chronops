"use client";

import { FileText, Frame, LayoutDashboard, Shield, SlidersHorizontal } from "lucide-react";
import type * as React from "react";

import { Link, useParams, useRouterState } from "@tanstack/react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { cn } from "@/lib/utils";
import { OrgSwitcher } from "@/widgets/sidebar/org-switcher";

type NavItem = {
  title: string;
  to: "/org/$slug" | "/org/$slug/framework" | "/org/$slug/control" | "/org/$slug/document";
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

export function AppSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
  const { slug } = useParams({ from: "/org/$slug" });
  const location = useRouterState({ select: (s) => s.location });

  const nav: NavItem[] = [
    { title: "Dashboard", to: "/org/$slug", icon: LayoutDashboard, exact: true },
    { title: "Frameworks", to: "/org/$slug/framework", icon: Shield },
    { title: "Controls", to: "/org/$slug/control", icon: SlidersHorizontal },
    { title: "Documents", to: "/org/$slug/document", icon: FileText },
  ];

  return (
    <Sidebar collapsible="offcanvas" className={cn("border-r", className)} {...props}>
      <SidebarHeader className="gap-3 p-3">
        <OrgSwitcher />
      </SidebarHeader>

      <SidebarContent className="gap-3 px-2 py-1">
        <SidebarMenu className="gap-2">
          {nav.map((item) => {
            const isActive = item.exact
              ? location.pathname === `/org/${slug}` || location.pathname === `/org/${slug}/`
              : location.pathname.startsWith(`/org/${slug}${item.to.replace("/org/$slug", "")}`);

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                  <Link to={item.to} params={{ slug }}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu className="gap-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link to="/org/$slug" params={{ slug }}>
                <Frame />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
