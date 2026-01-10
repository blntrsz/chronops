import { createFileRoute } from "@tanstack/react-router";

import { DocumentEditPage } from "@/features/document/components/document-edit-page";

export const Route = createFileRoute("/documents/$documentId")({
  component: DocumentEditRoute,
});

function DocumentEditRoute() {
  const { documentId } = Route.useParams();
  return <DocumentEditPage documentId={documentId} />;
}
