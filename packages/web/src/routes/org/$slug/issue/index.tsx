import { CreateIssue } from "@/features/issue/create-issue";
import { ListIssue } from "@/features/issue/list-issue";
import { OrgListLayout } from "@/widgets/layout/org-list-layout";
import { Control } from "@chronops/domain";
import { createFileRoute } from "@tanstack/react-router";
import { Schema } from "effect";

export const Route = createFileRoute("/org/$slug/issue/")({
  component: RouteComponent,
  validateSearch: Schema.standardSchemaV1(
    Schema.Struct({
      controlId: Schema.optional(Control.ControlId),
    }),
  ),
});

function RouteComponent() {
  const { controlId } = Route.useSearch();
  const { slug } = Route.useParams();

  return (
    <OrgListLayout title="Issues" action={<CreateIssue controlId={controlId} />}>
      <ListIssue slug={slug} controlId={controlId} />
    </OrgListLayout>
  );
}
