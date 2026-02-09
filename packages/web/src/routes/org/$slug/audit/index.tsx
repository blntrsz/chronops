import { CreateAudit } from "@/features/audit/create-audit";
import { ListAudit } from "@/features/audit/list-audit";
import { OrgListLayout } from "@/widgets/layout/org-list-layout";
import { AssessmentTemplate } from "@chronops/domain";
import { createFileRoute } from "@tanstack/react-router";
import { Schema } from "effect";

export const Route = createFileRoute("/org/$slug/audit/")({
  component: RouteComponent,
  validateSearch: Schema.standardSchemaV1(
    Schema.Struct({
      assessmentMethodId: Schema.optional(AssessmentTemplate.AssessmentTemplateId),
    }),
  ),
});

function RouteComponent() {
  const { assessmentMethodId } = Route.useSearch();
  const { slug } = Route.useParams();

  return (
    <OrgListLayout title="Audits" action={<CreateAudit />}>
      <ListAudit slug={slug} assessmentMethodId={assessmentMethodId} />
    </OrgListLayout>
  );
}
