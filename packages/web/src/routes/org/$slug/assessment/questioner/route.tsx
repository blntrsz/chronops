import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/org/$slug/assessment/questioner")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
