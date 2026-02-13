import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/org/$slug/evidence")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
