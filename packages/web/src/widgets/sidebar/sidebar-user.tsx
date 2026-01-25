"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { authClient } from "@/features/auth/client";
import { ClientOnly, Link } from "@tanstack/react-router";
import { LogOut, MoreVertical, Settings, User, UserIcon } from "lucide-react";

function initials(value: string) {
  const s = value.trim();
  if (!s) return "U";
  const parts = s.split(/\s+/).slice(0, 2);
  return parts
    .map((p) => p[0]?.toUpperCase())
    .filter(Boolean)
    .join("")
    .slice(0, 2);
}

export function SidebarUser({ className }: { className?: string }) {
  const session = authClient.useSession();
  const user = session.data?.user;

  const name = user?.name || user?.email || "User";
  const email = user?.email || "";
  const emailInitials = user?.email ? initials(user.email) : undefined;

  function logOut() {
    return authClient.signOut();
  }

  return (
    <ClientOnly
      fallback={
        <SidebarMenuItem className={className}>
          <SidebarMenuButton size="lg" className="justify-start gap-3">
            <Avatar className="size-9">
              <AvatarFallback className="text-xs">
                <UserIcon className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate font-medium leading-tight">User</div>
              <div className="text-sidebar-foreground/70 min-h-[1em] truncate text-xs" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      }
    >
      <SidebarMenuItem className={className}>
        <SidebarMenuButton size="lg" className="justify-start gap-3">
          <Avatar className="size-9">
            <AvatarFallback className="text-xs">
              {emailInitials ?? <UserIcon className="size-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate font-medium leading-tight">{name}</div>
            <div className="text-sidebar-foreground/70 min-h-[1em] truncate text-xs">{email}</div>
          </div>
        </SidebarMenuButton>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction aria-label="User menu" className="top-4">
              <MoreVertical className="size-4" />
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right" sideOffset={8} className="w-56">
            <DropdownMenuItem asChild>
              <Link to={"."}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={"."}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </ClientOnly>
  );
}
