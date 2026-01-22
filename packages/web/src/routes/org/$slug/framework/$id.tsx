import { useSetActiveDialog } from "@/atoms/dialog-atom";
import { GhostInput, GhostTextArea } from "@/components/ghost-input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { ListControl } from "@/features/control/list-control";
import { getFrameworkById, listFrameworks, updateFramework } from "@/features/framework/_atom";
import { DeleteFramework } from "@/features/framework/delete-framework";
import { cn } from "@/lib/utils";
import { OrgListLayout } from "@/widgets/layout/org-list-layout";
import { Result, useAtomRefresh, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { createFileRoute } from "@tanstack/react-router";
import { MoreHorizontal, Plus, Save, Trash2 } from "lucide-react";
import React from "react";

function FrameworkSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/org/$slug/framework/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id, slug } = Route.useParams();
  const fwk = useAtomValue(getFrameworkById(id as any));
  const setActiveDialog = useSetActiveDialog();

  const mutate = useAtomSet(updateFramework(), { mode: "promise" });
  const refreshDetail = useAtomRefresh(getFrameworkById(id as any));
  const refreshList = useAtomRefresh(listFrameworks(1));

  const model = Result.getOrElse(fwk, () => null);
  const fwkModel = model && model._tag === "Some" ? model.value : null;

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!fwkModel) return;
    setName(fwkModel.name);
    setDescription(fwkModel.description ?? "");
  }, [fwkModel?.id]);

  if (fwk._tag === "Initial") {
    return <FrameworkSkeleton />;
  }

  if (Result.isFailure(fwk)) {
    return <FieldDescription>Failed loading framework</FieldDescription>;
  }

  if (!fwkModel) {
    return <FieldDescription>Framework not found</FieldDescription>;
  }

  const dirty = name !== fwkModel.name || description !== (fwkModel.description ?? "");
  const canSave = dirty && !saving && name.trim() !== "";

  async function onSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      const nextName = name.trim();
      const nextDescription = description.trim();
      await mutate({
        payload: {
          id: id as any,
          data: {
            name: nextName,
            description: nextDescription === "" ? null : nextDescription,
          },
        },
      });
      refreshDetail();
      refreshList();
    } finally {
      setSaving(false);
    }
  }

  return (
    <OrgListLayout
      title={
        <div className="flex min-w-0 flex-col gap-1">
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
            className="text-muted-foreground min-h-0 w-full min-w-0 p-0 text-sm"
            placeholder="Description"
            rows={1}
          />
        </div>
      }
      action={
        <div className="flex items-center gap-2">
          <Button type="button" onClick={onSave} disabled={!canSave} className="gap-2">
            {saving ? <Spinner /> : <Save />}
            {saving ? "Saving..." : "Save"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Framework actions">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setActiveDialog("createControl")}>
                <Plus />
                Add controls
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setActiveDialog("deleteFramework")}
              >
                <Trash2 />
                Delete framework
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <DeleteFramework frameworkId={id as any} slug={slug} />

        <ListControl slug={slug} frameworkId={id} />
      </div>
    </OrgListLayout>
  );
}
