"use client";

import {
  CircleHelp,
  LayoutDashboard,
  Search,
  Settings,
  Shield,
  SlidersHorizontal,
  ClipboardCheck,
  AlertTriangle,
  FileText,
  ClipboardList,
  ShieldAlert,
  FileSearch,
} from "lucide-react";
import * as React from "react";

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
import { CommandDialog, CommandEmpty, CommandInput, CommandList } from "@/components/ui/command";

import { cn } from "@/lib/utils";
import { OrgSwitcher } from "@/widgets/sidebar/org-switcher";
import { SidebarUser } from "@/widgets/sidebar/sidebar-user";

type NavItem = {
  title: string;
  to:
    | "/org/$slug"
    | "/org/$slug/framework"
    | "/org/$slug/control"
    | "/org/$slug/issue"
    | "/org/$slug/assessment"
    | "/org/$slug/policy"
    | "/org/$slug/audit"
    | "/org/$slug/risk"
    | "/org/$slug/evidence";
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

export function AppSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
  const { slug } = useParams({ from: "/org/$slug" });
  const location = useRouterState({ select: (s) => s.location });
  const [searchOpen, setSearchOpen] = React.useState(false);

  const nav: NavItem[] = [
    {
      title: "Dashboard",
      to: "/org/$slug",
      icon: LayoutDashboard,
      exact: true,
    },
    { title: "Frameworks", to: "/org/$slug/framework", icon: Shield },
    { title: "Controls", to: "/org/$slug/control", icon: SlidersHorizontal },
    { title: "Policies", to: "/org/$slug/policy", icon: FileText },
    { title: "Issues", to: "/org/$slug/issue", icon: AlertTriangle },
    { title: "Risks", to: "/org/$slug/risk", icon: ShieldAlert },
    { title: "Assessments", to: "/org/$slug/assessment", icon: ClipboardCheck },
    { title: "Audits", to: "/org/$slug/audit", icon: ClipboardList },
    { title: "Evidence", to: "/org/$slug/evidence", icon: FileSearch },
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
              : location.pathname.startsWith(`/org/${slug}${item.to.replace("/org/$slug", "")}`) ||
                location.pathname.startsWith(`/org/${slug}${item.to.replace("/org/$slug", "")}/`);

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
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Get Help">
              <a href="mailto:support@chronops.dev">
                <CircleHelp />
                <span>Get Help</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Search">
              <button type="button" onClick={() => setSearchOpen(true)}>
                <Search />
                <span>Search</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarUser />
        </SidebarMenu>

        <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
          </CommandList>
        </CommandDialog>
      </SidebarFooter>
    </Sidebar>
  );
}
