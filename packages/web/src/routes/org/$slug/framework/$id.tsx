import { createFileRoute } from "@tanstack/react-router";

import { FrameworkEditPage } from "@/features/framework/components/framework-edit-page";

export const Route = createFileRoute("/org/$slug/framework/$id")({
  component: FrameworkEditRoute,
});

function FrameworkEditRoute() {
  const { id } = Route.useParams();
  return <FrameworkEditPage frameworkId={id} />;
}
