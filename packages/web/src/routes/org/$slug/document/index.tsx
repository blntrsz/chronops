import { ListDocuments } from "@/features/document/list-documents";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/org/$slug/document/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ListDocuments />;
}
