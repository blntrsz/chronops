import { createFileRoute } from "@tanstack/react-router";

import { DocumentListPage } from "@/features/document/components/document-list-page";

export const Route = createFileRoute("/org/$slug/document/")({
  component: DocumentListPage,
});
