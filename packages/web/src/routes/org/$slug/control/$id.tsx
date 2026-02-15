import { GhostInput, GhostTextArea } from "@/components/ghost-input";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getControlById, listControls, updateControl } from "@/features/control/_atom";
import { MetadataSidebar } from "@/widgets/layout/metadata-sidebar";
import { CommentsSection } from "@/features/comment/comments-section";
import { ListAssessmentTemplates } from "@/features/assessment/list-templates";
import { ListRisk } from "@/features/risk/list-risk";
import { useSetActiveDialog } from "@/atoms/dialog-atom";
import { useAutosaveFields } from "@/hooks/use-autosave-fields";
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

type ControlModel = {
  id: string;
  name: string;
  description?: string | null;
  status?: string | null;
  frameworkId?: string | null;
  testingFrequency?: string | null;
  updatedAt?: unknown;
};

type ControlHeaderRightProps = {
  statusLabel: string;
  isMetaOpen: boolean;
  onToggle: () => void;
};

function ControlHeaderRight({ statusLabel, isMetaOpen, onToggle }: ControlHeaderRightProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{statusLabel}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onToggle}
        aria-expanded={isMetaOpen}
        aria-controls="control-metadata"
        aria-label={isMetaOpen ? "Hide metadata" : "Show metadata"}
      >
        <PanelRight />
      </Button>
    </div>
  );
}

function ControlMainContent({ id }: { id: string }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Overview</h2>
        <p className="text-muted-foreground text-sm">
          Control detail placeholder; add widgets next.
        </p>
      </div>

      <CommentsSection entityId={id as never} />
    </div>
  );
}

type ControlMetadataPanelProps = {
  control: ControlModel;
};

function ControlMetadataPanel({ control }: ControlMetadataPanelProps) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <div className="text-xs uppercase text-muted-foreground">ID</div>
        <div className="mt-1 font-medium text-foreground">{control.id}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Status</div>
        <div className="mt-1 font-medium text-foreground">{control.status ?? "—"}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Framework</div>
        <div className="mt-1 font-medium text-foreground">{control.frameworkId ?? "—"}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Testing Frequency</div>
        <div className="mt-1 font-medium text-foreground">{control.testingFrequency ?? "—"}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Updated</div>
        <div className="mt-1 font-medium text-foreground">{formatUpdatedAt(control.updatedAt)}</div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/org/$slug/control/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id, slug } = Route.useParams();
  const setActiveDialog = useSetActiveDialog();
  const controlState = useAtomValue(getControlById(id as never));
  const mutate = useAtomSet(updateControl(), { mode: "promise" });
  const refreshDetail = useAtomRefresh(getControlById(id as never));
  const refreshList = useAtomRefresh(listControls(1));

  const controlModel = Result.getOrElse(controlState, () => null);
  const [isMetaOpen, setIsMetaOpen] = React.useState(true);

  const { name, setName, description, setDescription, statusLabel } = useAutosaveFields({
    id: controlModel?.id ?? null,
    name: controlModel?.name,
    description: controlModel?.description,
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
    () => (
      <ControlHeaderRight
        statusLabel={statusLabel}
        isMetaOpen={isMetaOpen}
        onToggle={() => setIsMetaOpen((value) => !value)}
      />
    ),
    [isMetaOpen, statusLabel],
  );

  useAppHeaderSlots({ right: headerRight }, [headerRight]);

  const control = controlModel as ControlModel | null;

  if (controlState._tag === "Initial") {
    return <ControlSkeleton />;
  }

  if (Result.isFailure(controlState)) {
    return <FieldDescription>Failed loading control</FieldDescription>;
  }

  if (!controlModel || !control) {
    return <FieldDescription>Control not found</FieldDescription>;
  }

  return (
    <OrgListLayout title={null} action={null} className="gap-0 pr-0">
      <div className="relative flex min-h-[calc(100vh-140px)] flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-0">
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-4 py-6">
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
            <Tabs defaultValue="overview" className="flex flex-col gap-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="risks">Risks</TabsTrigger>
                <TabsTrigger value="assessments">Assessments</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="m-0">
                <ControlMainContent id={id} />
              </TabsContent>
              <TabsContent value="risks" className="m-0">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Risks</h2>
                    <Button onClick={() => setActiveDialog("createRisk")}>Create risk</Button>
                  </div>
                  <ListRisk slug={slug} filter={{ controlId: id as never }} />
                </div>
              </TabsContent>
              <TabsContent value="assessments" className="m-0">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Assessments</h2>
                    <Button onClick={() => setActiveDialog("createAssessmentTemplate")}>
                      Create assessment
                    </Button>
                  </div>
                  <ListAssessmentTemplates controlId={id} slug={slug} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <MetadataSidebar id="control-metadata" open={isMetaOpen} onOpenChange={setIsMetaOpen}>
          <ControlMetadataPanel control={control} />
        </MetadataSidebar>
      </div>
    </OrgListLayout>
  );
}
