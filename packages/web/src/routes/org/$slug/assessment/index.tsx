import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateAssessmentTemplate } from "@/features/assessment/create-template";
import { ListAssessmentTemplates } from "@/features/assessment/list-templates";
import { CreateQuestionerTemplate } from "@/features/questioner/create-template";
import { ListQuestionerTemplates } from "@/features/questioner/list-templates";
import { OrgListLayout } from "@/widgets/layout/org-list-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/org/$slug/assessment/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <OrgListLayout title="Assessments">
      <Tabs defaultValue="assessments" className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="questioners">Questioners</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <TabsContent value="assessments" className="m-0">
              <CreateAssessmentTemplate
                trigger={<Button type="button">Create assessment</Button>}
              />
            </TabsContent>
            <TabsContent value="questioners" className="m-0">
              <CreateQuestionerTemplate
                trigger={<Button type="button">Create questioner</Button>}
              />
            </TabsContent>
          </div>
        </div>
        <TabsContent value="assessments" className="mt-6">
          <ListAssessmentTemplates />
        </TabsContent>
        <TabsContent value="questioners" className="mt-6">
          <ListQuestionerTemplates />
        </TabsContent>
      </Tabs>
    </OrgListLayout>
  );
}
