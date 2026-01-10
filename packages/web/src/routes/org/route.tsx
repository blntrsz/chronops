import { AppHeader } from "@/widgets/header/app-header";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/org")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <AppHeader />
      <main className="p-4">
        <Outlet />
      </main>
    </>
  );
}
