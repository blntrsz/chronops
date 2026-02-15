import { Sidebar, SidebarContent, SidebarHeader, SidebarSeparator } from "@/components/ui/sidebar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type * as React from "react";

type MetadataSidebarProps = {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
};

export function MetadataSidebar({
  id,
  open,
  onOpenChange,
  children,
  title = "Metadata",
}: MetadataSidebarProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[320px] p-0 sm:max-w-[320px]">
          <SheetHeader className="px-4 py-3">
            <SheetTitle className="text-xs uppercase text-muted-foreground font-normal">
              {title}
            </SheetTitle>
            <SheetDescription className="sr-only">{title} panel</SheetDescription>
          </SheetHeader>
          <SidebarSeparator />
          <div className="gap-4 px-4 py-4 overflow-y-auto flex-1">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sidebar
      id={id}
      side="right"
      collapsible="none"
      className={cn(
        "border-l transition-[width,opacity] duration-300 lg:-mt-4 lg:sticky lg:top-14 lg:h-[calc(100vh-56px)] lg:ml-4",
        open ? "w-[320px] opacity-100" : "w-0 opacity-0",
      )}
      aria-hidden={!open}
    >
      <div className={cn("flex h-full w-full flex-col", open ? "" : "pointer-events-none")}>
        <SidebarHeader className="px-4 py-3">
          <div className="text-xs uppercase text-muted-foreground">{title}</div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent className="gap-4 px-4 py-4">{children}</SidebarContent>
      </div>
    </Sidebar>
  );
}
