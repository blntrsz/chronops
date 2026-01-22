import { organizationMiddleware } from "@/features/auth/middleware";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/org")({
  component: RouteComponent,
  server: {
    middleware: [organizationMiddleware],
  },
});

function RouteComponent() {
  return <Outlet />;
}
