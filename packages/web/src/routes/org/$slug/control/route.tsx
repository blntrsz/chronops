import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/org/$slug/control")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
