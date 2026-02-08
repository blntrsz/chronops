import { GhostInput, GhostTextArea } from "@/components/ghost-input";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar, SidebarContent, SidebarHeader, SidebarSeparator } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { getPolicyById, listPolicies, updatePolicy } from "@/features/policy/_atom";
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

function PolicySkeleton() {
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

type PolicyModel = {
  id: string;
  title: string;
  description?: string | null;
  status?: string | null;
  version?: string | null;
  ownerId?: string | null;
  controlId?: string | null;
  effectiveAt?: unknown;
  reviewDueAt?: unknown;
  reviewFrequency?: string | null;
  updatedAt?: unknown;
};

type PolicyHeaderRightProps = {
  statusLabel: string;
  isMetaOpen: boolean;
  onToggle: () => void;
};

function PolicyHeaderRight({ statusLabel, isMetaOpen, onToggle }: PolicyHeaderRightProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{statusLabel}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onToggle}
        aria-expanded={isMetaOpen}
        aria-controls="policy-metadata"
        aria-label={isMetaOpen ? "Hide metadata" : "Show metadata"}
      >
        <PanelRight />
      </Button>
    </div>
  );
}

type PolicyMainContentProps = {
  id: string;
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
};

function PolicyMainContent({
  id,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: PolicyMainContentProps) {
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
        <p className="text-muted-foreground text-sm">
          Policy detail placeholder; add sections next.
        </p>
      </div>

      <CommentsSection entityId={id as never} />
    </div>
  );
}

type PolicyMetadataPanelProps = {
  policy: PolicyModel;
};

function PolicyMetadataPanel({ policy }: PolicyMetadataPanelProps) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <div className="text-xs uppercase text-muted-foreground">ID</div>
        <div className="mt-1 font-medium text-foreground">{policy.id}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Status</div>
        <div className="mt-1 font-medium text-foreground">{policy.status ?? "—"}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Owner</div>
        <div className="mt-1 font-medium text-foreground">{policy.ownerId ?? "—"}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Control</div>
        <div className="mt-1 font-medium text-foreground">{policy.controlId ?? "—"}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Version</div>
        <div className="mt-1 font-medium text-foreground">{policy.version ?? "—"}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Review</div>
        <div className="mt-1 font-medium text-foreground">{policy.reviewFrequency ?? "—"}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Review due</div>
        <div className="mt-1 font-medium text-foreground">
          {formatUpdatedAt(policy.reviewDueAt)}
        </div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Updated</div>
        <div className="mt-1 font-medium text-foreground">{formatUpdatedAt(policy.updatedAt)}</div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/org/$slug/policy/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const policyState = useAtomValue(getPolicyById(id as never));
  const mutate = useAtomSet(updatePolicy(), { mode: "promise" });
  const refreshDetail = useAtomRefresh(getPolicyById(id as never));
  const refreshList = useAtomRefresh(listPolicies(1));

  const policyModel = Result.getOrElse(policyState, () => null);
  const [isMetaOpen, setIsMetaOpen] = React.useState(true);

  const { name, setName, description, setDescription, statusLabel } = useAutosaveFields({
    id: policyModel?.id ?? null,
    name: policyModel?.title,
    description: policyModel?.description,
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
      <PolicyHeaderRight
        statusLabel={statusLabel}
        isMetaOpen={isMetaOpen}
        onToggle={() => setIsMetaOpen((value) => !value)}
      />
    ),
    [isMetaOpen, statusLabel],
  );

  useAppHeaderSlots({ right: headerRight }, [headerRight]);

  const policy = policyModel as PolicyModel | null;

  if (policyState._tag === "Initial") {
    return <PolicySkeleton />;
  }

  if (Result.isFailure(policyState)) {
    return <FieldDescription>Failed loading policy</FieldDescription>;
  }

  if (!policyModel || !policy) {
    return <FieldDescription>Policy not found</FieldDescription>;
  }

  const mainContent = (
    <PolicyMainContent
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
        <Sidebar
          id="policy-metadata"
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
            <SidebarContent className="gap-4 px-4 py-4">
              <PolicyMetadataPanel policy={policy} />
            </SidebarContent>
          </div>
        </Sidebar>
      </div>
    </OrgListLayout>
  );
}
