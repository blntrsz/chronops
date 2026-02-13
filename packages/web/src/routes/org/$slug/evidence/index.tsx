import { useSetActiveDialog } from "@/atoms/dialog-atom";
import { Button } from "@/components/ui/button";
import { ListEvidence } from "@/features/evidence/list-evidence";
import { OrgListLayout } from "@/widgets/layout/org-list-layout";
import { Control } from "@chronops/domain";
import { createFileRoute } from "@tanstack/react-router";
import { Schema } from "effect";

export const Route = createFileRoute("/org/$slug/evidence/")({
  component: RouteComponent,
  validateSearch: Schema.standardSchemaV1(
    Schema.Struct({
      controlId: Schema.optional(Control.ControlId),
    }),
  ),
});

function RouteComponent() {
  const { slug } = Route.useParams();
  const { controlId } = Route.useSearch();
  const setActiveDialog = useSetActiveDialog();

  return (
    <OrgListLayout
      title="Evidence"
      action={<Button onClick={() => setActiveDialog("createEvidence")}>Create evidence</Button>}
    >
      <ListEvidence slug={slug} filter={{ controlId }} />
    </OrgListLayout>
  );
}
