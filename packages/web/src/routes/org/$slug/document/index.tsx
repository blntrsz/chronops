import { Button } from "@/components/ui/button";
import { ListDocuments } from "@/features/document/list-documents";
import { useSetActiveDialog } from "@/atoms/dialog-atom";
import { OrgListLayout } from "@/widgets/layout/org-list-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/org/$slug/document/")({
  component: RouteComponent,
});

function RouteComponent() {
  const setActiveDialog = useSetActiveDialog();

  return (
    <OrgListLayout
      title="Documents"
      action={<Button onClick={() => setActiveDialog("createDocument")}>Create document</Button>}
    >
      <ListDocuments />
    </OrgListLayout>
  );
}
