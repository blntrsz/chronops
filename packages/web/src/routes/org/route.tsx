import { organizationMiddleware } from "@/features/auth/middleware.server";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { OrgRouteRedirect } from "./-route-redirect";

export const Route = createFileRoute("/org")({
  component: RouteComponent,
  server: {
    middleware: [organizationMiddleware],
  },
});

function RouteComponent() {
  return (
    <>
      <OrgRouteRedirect />
      <Outlet />
    </>
  );
}
