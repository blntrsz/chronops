import { CreateDocument } from "@/features/document/create-document";
import { CreateFramework } from "@/features/framework/create-framework";
import { Outlet, createFileRoute } from "@tanstack/react-router";

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
