"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { useNavigate } from "@tanstack/react-router";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { authClient } from "@/features/auth/client";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const chars = parts.map((p) => p[0]?.toUpperCase()).filter(Boolean);
  return chars.join("") || "O";
}

export function OrgSwitcher() {
  const active = authClient.useActiveOrganization();
  const orgs = authClient.useListOrganizations();
  const navigate = useNavigate();

  const activeOrg = active.data;
  const activeName = activeOrg?.name ?? "Organization";

  async function setActive(slug: string) {
    await authClient.organization.setActive({ organizationSlug: slug });
    navigate({ to: "/org/$slug", params: { slug } });
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold">
                  {initials(activeName)}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium leading-tight">
                    {active.isPending ? "Loading..." : activeName}
                  </div>
                  <div className="text-sidebar-foreground/70 truncate text-xs">
                    {activeOrg?.slug ?? ""}
                  </div>
                </div>
              </div>
              <ChevronsUpDown className="size-4 shrink-0" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-72" align="start" side="right" sideOffset={8}>
            {(orgs.data ?? []).map((org) => {
              const isActive = org.slug === activeOrg?.slug;
              return (
                <DropdownMenuItem
                  key={org.id}
                  className="gap-2"
                  onClick={() => setActive(org.slug)}
                >
                  <div className="flex size-7 items-center justify-center rounded-md border">
                    {initials(org.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{org.name}</div>
                    <div className="text-muted-foreground truncate text-xs">{org.slug}</div>
                  </div>
                  {isActive ? <Check className="ml-auto size-4" /> : null}
                </DropdownMenuItem>
              );
            })}

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => navigate({ to: "/org/create" })} className="gap-2">
              <Plus className="size-4" />
              Create org
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
