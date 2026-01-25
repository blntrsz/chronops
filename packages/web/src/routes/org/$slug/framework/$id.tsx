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
import { ListControl } from "@/features/control/list-control";
import { CommentsSection } from "@/features/comment/comments-section";
import { getFrameworkById, listFrameworks, updateFramework } from "@/features/framework/_atom";
import { DeleteFramework } from "@/features/framework/delete-framework";
import { cn } from "@/lib/utils";
import { OrgListLayout } from "@/widgets/layout/org-list-layout";
import { useAppHeaderSlots } from "@/widgets/header/app-header-slots";
import { Result, useAtomRefresh, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { createFileRoute } from "@tanstack/react-router";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
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
  const fwk = useAtomValue(getFrameworkById(id as never));
  const setActiveDialog = useSetActiveDialog();

  const mutate = useAtomSet(updateFramework(), { mode: "promise" });
  const refreshDetail = useAtomRefresh(getFrameworkById(id as never));
  const refreshList = useAtomRefresh(listFrameworks(1));

  const model = Result.getOrElse(fwk, () => null);
  const fwkModel = model && model._tag === "Some" ? model.value : null;

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<"saved" | "saving" | "unsaved" | "invalid" | "error">(
    "saved",
  );
  const saveCalledRef = React.useRef(0);
  const timerRef = React.useRef<number | null>(null);
  const lastIdRef = React.useRef<string | null>(null);
  const dirty = fwkModel ? name !== fwkModel.name || description !== (fwkModel.description ?? "") : false;
  const isValid = name.trim() !== "";

  React.useEffect(() => {
    if (!fwkModel) return;

    if (lastIdRef.current !== fwkModel.id) {
      lastIdRef.current = fwkModel.id;
      setName(fwkModel.name);
      setDescription(fwkModel.description ?? "");
      setSaveStatus("saved");
    }
  }, [fwkModel]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (!dirty) {
      setSaveStatus("saved");
      return;
    }
    if (!isValid) {
      setSaveStatus("invalid");
      return;
    }

    setSaveStatus("unsaved");
    timerRef.current = window.setTimeout(async () => {
      const callId = ++saveCalledRef.current;
      setSaving(true);
      setSaveStatus("saving");
      try {
        const nextName = name.trim();
        const nextDescription = description.trim();
        await mutate({
          payload: {
            id: id as never,
            data: {
              name: nextName,
              description: nextDescription === "" ? null : nextDescription,
            },
          },
        });
        if (callId === saveCalledRef.current) {
          refreshDetail();
          refreshList();
          setSaveStatus("saved");
        }
      } catch {
        if (callId === saveCalledRef.current) setSaveStatus("error");
      } finally {
        if (callId === saveCalledRef.current) setSaving(false);
      }
    }, 800);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [dirty, isValid, name, description, mutate, refreshDetail, refreshList, id]);

  const statusLabel = saving
    ? "Saving..."
    : saveStatus === "saved"
      ? "Saved"
      : saveStatus === "invalid"
        ? "Name required"
        : saveStatus === "error"
          ? "Save failed"
          : "Unsaved";

  const headerRight = React.useMemo(() => {
    if (!fwkModel) return null;

    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{statusLabel}</span>
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
    );
  }, [fwkModel, statusLabel, setActiveDialog]);

  useAppHeaderSlots({ right: headerRight }, [headerRight]);

  if (fwk._tag === "Initial") {
    return <FrameworkSkeleton />;
  }

  if (Result.isFailure(fwk)) {
    return <FieldDescription>Failed loading framework</FieldDescription>;
  }

  if (!fwkModel) {
    return <FieldDescription>Framework not found</FieldDescription>;
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
      action={null}
    >
      <div className="flex flex-col gap-6">
        <DeleteFramework frameworkId={id as never} slug={slug} />

        <ListControl slug={slug} frameworkId={id} />

        <CommentsSection entityId={id as never} />
      </div>
    </OrgListLayout>
  );
}
