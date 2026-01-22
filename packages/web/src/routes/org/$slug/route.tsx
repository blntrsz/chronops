import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CreateFramework } from "@/features/framework/create-framework";
import { CreateControl } from "@/features/control/create-control";
import { CreateDocument } from "@/features/document/create-document";
import { OrgShell } from "@/widgets/sidebar/org-shell";

export const Route = createFileRoute("/org/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <OrgShell>
      <CreateFramework />
      <CreateControl />
      <CreateDocument />
      <Outlet />
    </OrgShell>
  );
}
