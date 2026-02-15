import { GhostInput, GhostTextArea } from "@/components/ghost-input";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetadataSidebar } from "@/widgets/layout/metadata-sidebar";
import { getControlByTicket, listControls, updateControl } from "@/features/control/_atom";
import { CreateAssessmentTemplate } from "@/features/assessment/create-template";
import { ListAssessmentTemplates } from "@/features/assessment/list-templates";
import { CommentsSection } from "@/features/comment/comments-section";
import { CreateRisk } from "@/features/risk/create-risk";
import { ListRisk } from "@/features/risk/list-risk";
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
  ticket: string;
  name: string;
  description?: string | null;
  frameworkId: string;
  status?: string | null;
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

type ControlMetadataPanelProps = {
  control: ControlModel;
};

function ControlMetadataPanel({ control }: ControlMetadataPanelProps) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <div className="text-xs uppercase text-muted-foreground">Ticket</div>
        <div className="mt-1 font-medium text-foreground">{control.ticket}</div>
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
}

export const Route = createFileRoute("/org/$slug/control/$ticket")({
  component: RouteComponent,
});

function RouteComponent() {
  const { ticket, slug } = Route.useParams();
  const ctrl = useAtomValue(getControlByTicket(ticket as never));
  const mutate = useAtomSet(updateControl(), { mode: "promise" });
  const refreshDetail = useAtomRefresh(getControlByTicket(ticket as never));
  const refreshList = useAtomRefresh(listControls(1));

  const ctrlModel = Result.getOrElse(ctrl, () => null);
  const [isMetaOpen, setIsMetaOpen] = React.useState(true);

  const { name, setName, description, setDescription, statusLabel } = useAutosaveFields({
    id: ctrlModel?.id ?? null,
    name: ctrlModel?.name,
    description: ctrlModel?.description,
    onSave: async ({ name: nextName, description: nextDescription }) => {
      if (!ctrlModel) return;
      await mutate({
        payload: {
          id: ctrlModel.id as never,
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

  const control = ctrlModel as ControlModel | null;

  useAppHeaderSlots({ right: headerRight, breadcrumbLabel: control?.ticket }, [
    headerRight,
    control?.ticket,
  ]);

  if (ctrl._tag === "Initial") {
    return <ControlSkeleton />;
  }

  if (Result.isFailure(ctrl)) {
    return <FieldDescription>Failed loading control</FieldDescription>;
  }

  if (!ctrlModel || !control) {
    return <FieldDescription>Control not found</FieldDescription>;
  }

  return (
    <OrgListLayout title={null} action={null} className="gap-0 pr-0">
      <div className="relative flex min-h-[calc(100vh-140px)] flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-0">
        <div className="min-w-0 flex-1 py-6">
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
          <Tabs defaultValue="overview" className="mt-6 flex flex-col gap-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="assessments">Assessments</TabsTrigger>
              <TabsTrigger value="risks">Risks</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="m-0">
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Overview</h2>
                <p className="text-muted-foreground text-sm">
                  Minimal control dashboard placeholder; add widgets next.
                </p>
              </div>
              <CommentsSection entityId={control.id as never} />
            </TabsContent>
            <TabsContent value="assessments" className="m-0">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Assessments</h2>
                <CreateAssessmentTemplate
                  controlId={control.id as never}
                  trigger={<Button type="button">Create assessment</Button>}
                />
              </div>
              <ListAssessmentTemplates controlId={control.id} slug={slug} className="mt-4" />
            </TabsContent>
            <TabsContent value="risks" className="m-0">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Risks</h2>
                <CreateRisk trigger={<Button type="button">Create risk</Button>} />
              </div>
              <ListRisk slug={slug} filter={{ controlId: control.id as never }} className="mt-4" />
            </TabsContent>
          </Tabs>
        </div>
        <MetadataSidebar id="control-metadata" open={isMetaOpen} onOpenChange={setIsMetaOpen}>
          <ControlMetadataPanel control={control} />
        </MetadataSidebar>
      </div>
    </OrgListLayout>
  );
}
