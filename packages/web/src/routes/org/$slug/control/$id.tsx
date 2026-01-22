import { GhostInput, GhostTextArea } from "@/components/ghost-input";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getControlById, listControls, updateControl } from "@/features/control/_atom";
import { OrgListLayout } from "@/widgets/layout/org-list-layout";
import { Result, useAtomRefresh, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { createFileRoute } from "@tanstack/react-router";
import { DateTime } from "effect";
import { Save } from "lucide-react";
import React from "react";

const updatedAtFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatUpdatedAt(value: unknown) {
  if (value == null) return "—";
  try {
    const dt = DateTime.isDateTime(value) ? value : DateTime.unsafeMake(value as any);
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
  const ctrl = useAtomValue(getControlById(id as any));
  const mutate = useAtomSet(updateControl(), { mode: "promise" });
  const refreshDetail = useAtomRefresh(getControlById(id as any));
  const refreshList = useAtomRefresh(listControls(1));

  const model = Result.getOrElse(ctrl, () => null);
  const ctrlModel = model && model._tag === "Some" ? model.value : null;

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!ctrlModel) return;
    setName(ctrlModel.name);
    setDescription(ctrlModel.description ?? "");
  }, [ctrlModel]);

  if (ctrl._tag === "Initial") {
    return <ControlSkeleton />;
  }

  if (Result.isFailure(ctrl)) {
    return <FieldDescription>Failed loading control</FieldDescription>;
  }

  if (!ctrlModel) {
    return <FieldDescription>Control not found</FieldDescription>;
  }

  const control = ctrlModel;
  const dirty = name !== ctrlModel.name || description !== (ctrlModel.description ?? "");
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

  const mainContent = (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <GhostInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-auto w-full min-w-0 p-0 text-2xl font-semibold focus-visible:ring-0"
          />
          <GhostTextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-muted-foreground min-h-0 w-full min-w-0 p-0 text-sm"
            placeholder="Description"
            rows={1}
          />
        </div>
        <Button type="button" onClick={onSave} disabled={!canSave} className="gap-2">
          {saving ? <Spinner /> : <Save />}
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Overview</h2>
        <p className="text-muted-foreground text-sm">
          Minimal control dashboard placeholder; add widgets next.
        </p>
      </div>
    </div>
  );

  const metadataContent = (
    <div className="h-full bg-muted/50 p-6 text-sm">
      <div className="space-y-4">
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
          <div className="mt-1 font-medium text-foreground">
            {formatUpdatedAt(control.updatedAt)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <OrgListLayout title={null} action={null} className="gap-0">
      <div className="lg:grid lg:min-h-[calc(100vh-140px)] lg:items-stretch lg:gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="lg:hidden">
          <Tabs defaultValue="main" className="gap-4">
            <TabsList className="w-full">
              <TabsTrigger value="main">Main</TabsTrigger>
              <TabsTrigger value="meta">Metadata</TabsTrigger>
            </TabsList>
            <TabsContent value="main">{mainContent}</TabsContent>
            <TabsContent value="meta">{metadataContent}</TabsContent>
          </Tabs>
        </div>

        <div className="hidden lg:block">{mainContent}</div>
        <div className="hidden lg:block">{metadataContent}</div>
      </div>
    </OrgListLayout>
  );
}
