import { GhostInput, GhostTextArea } from "@/components/ghost-input";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { getRiskById, listRisks, updateRisk } from "@/features/risk/_atom";
import { MetadataSidebar } from "@/widgets/layout/metadata-sidebar";
import { CommentsSection } from "@/features/comment/comments-section";
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

function RiskSkeleton() {
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

type RiskModel = {
  id: string;
  title: string;
  description?: string | null;
  status?: string | null;
  likelihood?: string | null;
  impact?: string | null;
  score?: number | null;
  treatment?: string | null;
  controlId?: string | null;
  updatedAt?: unknown;
};

type RiskHeaderRightProps = {
  statusLabel: string;
  isMetaOpen: boolean;
  onToggle: () => void;
};

function RiskHeaderRight({ statusLabel, isMetaOpen, onToggle }: RiskHeaderRightProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{statusLabel}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onToggle}
        aria-expanded={isMetaOpen}
        aria-controls="risk-metadata"
        aria-label={isMetaOpen ? "Hide metadata" : "Show metadata"}
      >
        <PanelRight />
      </Button>
    </div>
  );
}

type RiskMainContentProps = {
  id: string;
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
};

function RiskMainContent({
  id,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: RiskMainContentProps) {
  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <GhostInput
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="h-auto w-full min-w-0 p-0 text-2xl font-semibold focus-visible:ring-0"
        />
        <GhostTextArea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="text-muted-foreground min-h-12 w-full min-w-0 p-0 text-sm"
          placeholder="Description"
          rows={1}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Overview</h2>
        <p className="text-muted-foreground text-sm">Risk detail placeholder; add widgets next.</p>
      </div>

      <CommentsSection entityId={id as never} />
    </div>
  );
}

type RiskMetadataPanelProps = {
  risk: RiskModel;
};

function RiskMetadataPanel({ risk }: RiskMetadataPanelProps) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <div className="text-xs uppercase text-muted-foreground">ID</div>
        <div className="mt-1 font-medium text-foreground">{risk.id}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Status</div>
        <div className="mt-1 font-medium text-foreground">{risk.status ?? "—"}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Likelihood</div>
        <div className="mt-1 font-medium text-foreground">{risk.likelihood ?? "—"}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Impact</div>
        <div className="mt-1 font-medium text-foreground">{risk.impact ?? "—"}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Score</div>
        <div className="mt-1 font-medium text-foreground">{risk.score ?? "—"}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Treatment</div>
        <div className="mt-1 font-medium text-foreground">{risk.treatment ?? "—"}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Control</div>
        <div className="mt-1 font-medium text-foreground">{risk.controlId ?? "—"}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Updated</div>
        <div className="mt-1 font-medium text-foreground">{formatUpdatedAt(risk.updatedAt)}</div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/org/$slug/risk/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const riskState = useAtomValue(getRiskById(id as never));
  const mutate = useAtomSet(updateRisk(), { mode: "promise" });
  const refreshDetail = useAtomRefresh(getRiskById(id as never));
  const refreshList = useAtomRefresh(listRisks(1));

  const riskModel = Result.getOrElse(riskState, () => null);
  const [isMetaOpen, setIsMetaOpen] = React.useState(true);

  const { name, setName, description, setDescription, statusLabel } = useAutosaveFields({
    id: riskModel?.id ?? null,
    name: riskModel?.title,
    description: riskModel?.description,
    onSave: async ({ name: nextTitle, description: nextDescription }) => {
      await mutate({
        payload: {
          id: id as never,
          data: {
            title: nextTitle,
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
      <RiskHeaderRight
        statusLabel={statusLabel}
        isMetaOpen={isMetaOpen}
        onToggle={() => setIsMetaOpen((value) => !value)}
      />
    ),
    [isMetaOpen, statusLabel],
  );

  useAppHeaderSlots({ right: headerRight }, [headerRight]);

  const risk = riskModel as RiskModel | null;

  if (riskState._tag === "Initial") {
    return <RiskSkeleton />;
  }

  if (Result.isFailure(riskState)) {
    return <FieldDescription>Failed loading risk</FieldDescription>;
  }

  if (!riskModel || !risk) {
    return <FieldDescription>Risk not found</FieldDescription>;
  }

  const mainContent = (
    <RiskMainContent
      id={id}
      title={name}
      description={description}
      onTitleChange={setName}
      onDescriptionChange={setDescription}
    />
  );

  return (
    <OrgListLayout title={null} action={null} className="gap-0 pr-0">
      <div className="relative flex min-h-[calc(100vh-140px)] flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-0">
        <div className="min-w-0 flex-1">{mainContent}</div>
        <MetadataSidebar id="risk-metadata" open={isMetaOpen} onOpenChange={setIsMetaOpen}>
          <RiskMetadataPanel risk={risk} />
        </MetadataSidebar>
      </div>
    </OrgListLayout>
  );
}
