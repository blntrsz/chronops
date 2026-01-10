import { createFileRoute } from "@tanstack/react-router";

import { ControlListPage } from "@/features/control/components/control-list-page";

export const Route = createFileRoute("/org/$slug/control/")({
  component: ControlListPage,
});
