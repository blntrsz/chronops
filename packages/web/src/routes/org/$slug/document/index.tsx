import { useSetActiveDialog } from "@/atoms/dialog-atom";
import { Button } from "@/components/ui/button";
import { ListDocuments } from "@/features/document/list-documents";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/org/$slug/document/")({
  component: RouteComponent,
});

function RouteComponent() {
  const setActiveDialog = useSetActiveDialog();

  return (
    <div>
      <Button onClick={() => setActiveDialog("createDocument")}>Create document</Button>
      <ListDocuments />
    </div>
  );
}
