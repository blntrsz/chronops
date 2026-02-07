import { Button } from "@/components/ui/button";
import { CreateAssessmentTemplate } from "@/features/assessment/create-template";
import { ListAssessmentTemplates } from "@/features/assessment/list-templates";
import { OrgListLayout } from "@/widgets/layout/org-list-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/org/$slug/assessment/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <OrgListLayout
      title="Assessments"
      action={
        <CreateAssessmentTemplate trigger={<Button type="button">Create assessment</Button>} />
      }
    >
      <ListAssessmentTemplates />
    </OrgListLayout>
  );
}
