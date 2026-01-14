import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CreateFramework } from "@/features/framework/create-framework";
import { CreateDocument } from "@/features/document/create-document";

export const Route = createFileRoute("/org/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <CreateFramework />
      <CreateDocument />
      <Outlet />
    </>
  );
}
