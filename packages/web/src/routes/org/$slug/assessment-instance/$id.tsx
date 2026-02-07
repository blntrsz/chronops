import { GhostInput } from "@/components/ghost-input";
import { FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAssessmentInstanceById,
  listAssessmentInstances,
  updateAssessmentInstance,
} from "@/features/assessment/_atom";
import { OrgListLayout } from "@/widgets/layout/org-list-layout";
import { useAppHeaderSlots } from "@/widgets/header/app-header-slots";
import { Result, useAtomRefresh, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";

function InstanceSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export const Route = createFileRoute("/org/$slug/assessment-instance/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const inst = useAtomValue(getAssessmentInstanceById(id as never));
  const mutate = useAtomSet(updateAssessmentInstance(), { mode: "promise" });
  const refreshDetail = useAtomRefresh(getAssessmentInstanceById(id as never));
  const refreshList = useAtomRefresh(listAssessmentInstances(1));

  const instModel = Result.getOrElse(inst, () => null);

  const [name, setName] = React.useState(instModel?.name ?? "");

  React.useEffect(() => {
    if (!instModel) return;
    setName(instModel.name ?? "");
  }, [instModel]);

  const onSaveName = React.useCallback(async () => {
    if (!instModel) return;
    if (name.trim() === instModel.name) return;
    await mutate({
      payload: {
        id: instModel.id as never,
        data: {
          name: name.trim(),
        },
      },
    });
    refreshDetail();
    refreshList();
  }, [instModel, mutate, name, refreshDetail, refreshList]);

  const headerRight = React.useMemo(
    () => <div className="text-xs text-muted-foreground">{instModel?.status ?? ""}</div>,
    [instModel],
  );

  useAppHeaderSlots({ right: headerRight }, [headerRight]);

  if (inst._tag === "Initial") {
    return <InstanceSkeleton />;
  }

  if (Result.isFailure(inst)) {
    return <FieldDescription>Failed loading instance</FieldDescription>;
  }

  if (!instModel) {
    return <FieldDescription>Instance not found</FieldDescription>;
  }

  return (
    <OrgListLayout title="Assessment instance" action={null}>
      <div className="flex flex-col gap-4">
        <GhostInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={onSaveName}
          className="h-auto w-full min-w-0 p-0 text-2xl font-semibold focus-visible:ring-0"
        />
        <div className="text-sm text-muted-foreground">control {instModel.controlId}</div>
        <div className="text-sm text-muted-foreground">template {instModel.templateId}</div>
        <div className="text-sm text-muted-foreground">status {instModel.status}</div>
      </div>
    </OrgListLayout>
  );
}
