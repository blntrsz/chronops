import { useSetActiveDialog } from "@/atoms/dialog-atom";
import { Button } from "@/components/ui/button";
import { ListRisk } from "@/features/risk/list-risk";
import { OrgListLayout } from "@/widgets/layout/org-list-layout";
import { Control, Risk } from "@chronops/domain";
import { createFileRoute } from "@tanstack/react-router";
import { Schema } from "effect";

export const Route = createFileRoute("/org/$slug/risk/")({
  component: RouteComponent,
  validateSearch: Schema.standardSchemaV1(
    Schema.Struct({
      controlId: Schema.optional(Control.ControlId),
      status: Schema.optional(Risk.RiskStatus),
      likelihood: Schema.optional(Risk.RiskLikelihood),
      impact: Schema.optional(Risk.RiskImpact),
      treatment: Schema.optional(Risk.RiskTreatment),
    }),
  ),
});

function RouteComponent() {
  const { slug } = Route.useParams();
  const { controlId, status, likelihood, impact, treatment } = Route.useSearch();
  const setActiveDialog = useSetActiveDialog();

  return (
    <OrgListLayout
      title="Risks"
      action={<Button onClick={() => setActiveDialog("createRisk")}>Create risk</Button>}
    >
      <ListRisk
        slug={slug}
        filter={{
          controlId,
          status,
          likelihood,
          impact,
          treatment,
        }}
      />
    </OrgListLayout>
  );
}
