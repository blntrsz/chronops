import { createFileRoute } from "@tanstack/react-router";

import { ControlEditPage } from "@/features/control/components/control-edit-page";

export const Route = createFileRoute("/org/$slug/control/$id")({
  component: ControlEditRoute,
});

function ControlEditRoute() {
  const { id } = Route.useParams();
  return <ControlEditPage controlId={id} />;
}
