import { CreatePolicy } from "@/features/policy/create-policy";
import { ListPolicy } from "@/features/policy/list-policy";
import { OrgListLayout } from "@/widgets/layout/org-list-layout";
import { Control } from "@chronops/domain";
import { createFileRoute } from "@tanstack/react-router";
import { Schema } from "effect";

export const Route = createFileRoute("/org/$slug/policy/")({
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
    <OrgListLayout title="Policies" action={<CreatePolicy />}>
      <ListPolicy slug={slug} controlId={controlId} />
    </OrgListLayout>
  );
}
