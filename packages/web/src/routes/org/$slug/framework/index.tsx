import { ListFrameworks } from "@/features/framework/list-frameworks";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/org/$slug/framework/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ListFrameworks />;
}
