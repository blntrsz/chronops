import { organizationMiddleware } from "@/features/auth/middleware";
import { AppHeader } from "@/widgets/header/app-header";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/org")({
  component: RouteComponent,
  server: {
    middleware: [organizationMiddleware],
  },
});

function RouteComponent() {
  return (
    <>
      <AppHeader />
      <div className="p-4">
        <Outlet />
      </div>
    </>
  );
}
