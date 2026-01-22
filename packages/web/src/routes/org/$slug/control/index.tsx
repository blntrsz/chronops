import { Button } from "@/components/ui/button";
import { ListControl } from "@/features/control/list-control";
import { useSetActiveDialog } from "@/atoms/dialog-atom";
import { OrgListLayout } from "@/widgets/layout/org-list-layout";
import { createFileRoute } from "@tanstack/react-router";
import { Schema } from "effect";

export const Route = createFileRoute("/org/$slug/control/")({
  component: RouteComponent,
  validateSearch: Schema.standardSchemaV1(
    Schema.Struct({
      frameworkId: Schema.optional(Schema.String),
    }),
  ),
});

function RouteComponent() {
  const { frameworkId } = Route.useSearch();
  const { slug } = Route.useParams();
  const setActiveDialog = useSetActiveDialog();

  return (
    <OrgListLayout
      title="Controls"
      action={<Button onClick={() => setActiveDialog("createControl")}>Create control</Button>}
    >
      <ListControl slug={slug} frameworkId={frameworkId} />
    </OrgListLayout>
  );
}
