import { CreateControl } from "@/features/control/create-control";
import { CreateDocument } from "@/features/document/create-document";
import { CreateFramework } from "@/features/framework/create-framework";
import { OrgShell } from "@/widgets/sidebar/org-shell";
import { Outlet, createFileRoute } from "@tanstack/react-router";

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
