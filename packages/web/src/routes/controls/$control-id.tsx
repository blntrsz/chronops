import { createFileRoute } from "@tanstack/react-router";

import { ControlEditPage } from "@/features/control/components/control-edit-page";

export const Route = createFileRoute("/controls/$controlId")({
  component: ControlEditRoute,
});

function ControlEditRoute() {
  const { controlId } = Route.useParams();
  return <ControlEditPage controlId={controlId} />;
}
