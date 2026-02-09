import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/org/$slug/audit")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
