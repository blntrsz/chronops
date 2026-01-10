import { createFileRoute } from "@tanstack/react-router";

import { FrameworkListPage } from "@/features/framework/components/framework-list-page";

export const Route = createFileRoute("/org/$slug/framework/")({
  component: FrameworkListPage,
});
