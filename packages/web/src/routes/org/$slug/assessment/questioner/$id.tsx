import { GhostInput, GhostTextArea } from "@/components/ghost-input";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateQuestionerInstance } from "@/features/questioner/create-instance";
import { ListQuestionerInstances } from "@/features/questioner/list-instances";
import {
  getQuestionerTemplateById,
  listQuestionerTemplates,
  updateQuestionerTemplate,
} from "@/features/questioner/_atom";
import { useAutosaveFields } from "@/hooks/use-autosave-fields";
import { cn } from "@/lib/utils";
import { OrgListLayout } from "@/widgets/layout/org-list-layout";
import { useAppHeaderSlots } from "@/widgets/header/app-header-slots";
import { Result, useAtomRefresh, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";

function TemplateSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export const Route = createFileRoute("/org/$slug/assessment/questioner/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const tmpl = useAtomValue(getQuestionerTemplateById(id as never));
  const mutate = useAtomSet(updateQuestionerTemplate(), { mode: "promise" });
  const refreshDetail = useAtomRefresh(getQuestionerTemplateById(id as never));
  const refreshList = useAtomRefresh(listQuestionerTemplates(1));

  const tmplModel = Result.getOrElse(tmpl, () => null);

  const { name, setName, description, setDescription, statusLabel } = useAutosaveFields({
    id: tmplModel?.id ?? null,
    name: tmplModel?.name,
    description: tmplModel?.description,
    onSave: async ({ name: nextName, description: nextDescription }) => {
      await mutate({
        payload: {
          id: id as never,
          data: {
            name: nextName,
            description: nextDescription,
          },
        },
      });
    },
    onSaved: () => {
      refreshDetail();
      refreshList();
    },
  });

  const headerRight = React.useMemo(
    () => <div className="text-xs text-muted-foreground">{statusLabel}</div>,
    [statusLabel],
  );

  useAppHeaderSlots({ right: headerRight }, [headerRight]);

  if (tmpl._tag === "Initial") {
    return <TemplateSkeleton />;
  }

  if (Result.isFailure(tmpl)) {
    return <FieldDescription>Failed loading questioner</FieldDescription>;
  }

  if (!tmplModel) {
    return <FieldDescription>Questioner not found</FieldDescription>;
  }

  return (
    <OrgListLayout
      title={
        <>
          <GhostInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={cn(
              "h-auto w-full min-w-0 p-0 text-2xl font-semibold",
              "focus-visible:ring-0",
            )}
          />
          <GhostTextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-muted-foreground min-h-12 w-full min-w-0 p-0 text-sm"
            placeholder="Description"
            rows={1}
          />
        </>
      }
      action={
        <CreateQuestionerInstance
          templateId={tmplModel.id}
          trigger={<Button type="button">Create instance</Button>}
        />
      }
    >
      <div className="flex flex-col gap-6">
        <div className="text-sm text-muted-foreground">{tmplModel.questions.length} questions</div>
        <ListQuestionerInstances templateId={tmplModel.id} />
      </div>
    </OrgListLayout>
  );
}
