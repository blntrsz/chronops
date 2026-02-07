import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/org/$slug/assessment")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
