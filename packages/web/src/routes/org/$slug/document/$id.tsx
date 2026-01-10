import { createFileRoute } from "@tanstack/react-router";

import { DocumentEditPage } from "@/features/document/components/document-edit-page";

export const Route = createFileRoute("/org/$slug/document/$id")({
  component: DocumentEditRoute,
});

function DocumentEditRoute() {
  const { id } = Route.useParams();
  return <DocumentEditPage documentId={id} />;
}
