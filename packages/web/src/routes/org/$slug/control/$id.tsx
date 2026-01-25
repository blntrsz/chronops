import { GhostInput, GhostTextArea } from "@/components/ghost-input";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar, SidebarContent, SidebarHeader, SidebarSeparator } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { getControlById, listControls, updateControl } from "@/features/control/_atom";
import { CommentsSection } from "@/features/comment/comments-section";
import { OrgListLayout } from "@/widgets/layout/org-list-layout";
import { useAppHeaderSlots } from "@/widgets/header/app-header-slots";
import { Result, useAtomRefresh, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { createFileRoute } from "@tanstack/react-router";
import { DateTime } from "effect";
import { PanelRight } from "lucide-react";
import React from "react";

const updatedAtFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatUpdatedAt(value: unknown) {
  if (value == null) return "—";
  try {
    const dt = DateTime.isDateTime(value) ? value : DateTime.unsafeMake(value as never);
    return DateTime.formatIntl(dt, updatedAtFormat);
  } catch {
    return String(value);
  }
}

function ControlSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/org/$slug/control/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const ctrl = useAtomValue(getControlById(id as never));
  const mutate = useAtomSet(updateControl(), { mode: "promise" });
  const refreshDetail = useAtomRefresh(getControlById(id as never));
  const refreshList = useAtomRefresh(listControls(1));

  const model = Result.getOrElse(ctrl, () => null);
  const ctrlModel = model && model._tag === "Some" ? model.value : null;

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<
    "saved" | "saving" | "unsaved" | "invalid" | "error"
  >("saved");
  const saveCalledRef = React.useRef(0);
  const timerRef = React.useRef<number | null>(null);
  const lastIdRef = React.useRef<string | null>(null);
  const [isMetaOpen, setIsMetaOpen] = React.useState(true);

  const statusLabel = saving
    ? "Saving..."
    : saveStatus === "saved"
      ? "Saved"
      : saveStatus === "invalid"
        ? "Name required"
        : saveStatus === "error"
          ? "Save failed"
          : "Unsaved";

  const headerRight = React.useMemo(
    () => (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{statusLabel}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsMetaOpen((value) => !value)}
          aria-expanded={isMetaOpen}
          aria-controls="control-metadata"
          aria-label={isMetaOpen ? "Hide metadata" : "Show metadata"}
        >
          <PanelRight />
        </Button>
      </div>
    ),
    [isMetaOpen, statusLabel],
  );

  useAppHeaderSlots({ right: headerRight }, [headerRight]);

  React.useEffect(() => {
    if (!ctrlModel) return;

    if (lastIdRef.current !== ctrlModel.id) {
      lastIdRef.current = ctrlModel.id;
      setName(ctrlModel.name);
      setDescription(ctrlModel.description ?? "");
      setSaveStatus("saved");
    }
  }, [ctrlModel]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const control = ctrlModel;
  const dirty = ctrlModel
    ? name !== ctrlModel.name || description !== (ctrlModel.description ?? "")
    : false;
  const isValid = name.trim() !== "";

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

  if (ctrl._tag === "Initial") {
    return <ControlSkeleton />;
  }

  if (Result.isFailure(ctrl)) {
    return <FieldDescription>Failed loading control</FieldDescription>;
  }

  if (!ctrlModel || !control) {
    return <FieldDescription>Control not found</FieldDescription>;
  }

  const mainContent = (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <GhostInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-auto w-full min-w-0 p-0 text-2xl font-semibold focus-visible:ring-0"
        />
        <GhostTextArea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="text-muted-foreground min-h-12 w-full min-w-0 p-0 text-sm"
          placeholder="Description"
          rows={1}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Overview</h2>
        <p className="text-muted-foreground text-sm">
          Minimal control dashboard placeholder; add widgets next.
        </p>
      </div>

      <CommentsSection entityId={id as never} />
    </div>
  );

  const metadataContent = (
    <div className="space-y-4 text-sm">
      <div>
        <div className="text-xs uppercase text-muted-foreground">ID</div>
        <div className="mt-1 font-medium text-foreground">{control.id}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Framework</div>
        <div className="mt-1 font-medium text-foreground">{control.frameworkId}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Status</div>
        <div className="mt-1 font-medium text-foreground">{control.status ?? "—"}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Testing</div>
        <div className="mt-1 font-medium text-foreground">{control.testingFrequency ?? "—"}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Updated</div>
        <div className="mt-1 font-medium text-foreground">{formatUpdatedAt(control.updatedAt)}</div>
      </div>
    </div>
  );

  return (
    <OrgListLayout title={null} action={null} className="gap-0 pr-0">
      <div className="relative flex min-h-[calc(100vh-140px)] flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-0">
        <div className="min-w-0 flex-1">{mainContent}</div>
        <Sidebar
          id="control-metadata"
          side="right"
          collapsible="none"
          className={cn(
            "border-l transition-[width,opacity] duration-300 lg:-mt-4 lg:sticky lg:top-14 lg:h-[calc(100vh-56px)] lg:ml-4",
            isMetaOpen ? "w-full opacity-100 lg:w-[320px]" : "w-0 opacity-0",
          )}
          aria-hidden={!isMetaOpen}
        >
          <div
            className={cn("flex h-full w-full flex-col", isMetaOpen ? "" : "pointer-events-none")}
          >
            <SidebarHeader className="px-4 py-3">
              <div className="text-xs uppercase text-muted-foreground">Metadata</div>
            </SidebarHeader>
            <SidebarSeparator />
            <SidebarContent className="gap-4 px-4 py-4">{metadataContent}</SidebarContent>
          </div>
        </Sidebar>
      </div>
    </OrgListLayout>
  );
}
