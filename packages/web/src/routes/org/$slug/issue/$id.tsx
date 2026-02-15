import { GhostInput, GhostTextArea } from "@/components/ghost-input";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { getIssueById, listIssues, updateIssue } from "@/features/issue/_atom";
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

function IssueSkeleton() {
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

type IssueModel = {
  id: string;
  title: string;
  description?: string | null;
  type?: string | null;
  status?: string | null;
  severity?: string | null;
  controlId?: string | null;
  updatedAt?: unknown;
};

type IssueHeaderRightProps = {
  statusLabel: string;
  isMetaOpen: boolean;
  onToggle: () => void;
};

function IssueHeaderRight({ statusLabel, isMetaOpen, onToggle }: IssueHeaderRightProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{statusLabel}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onToggle}
        aria-expanded={isMetaOpen}
        aria-controls="issue-metadata"
        aria-label={isMetaOpen ? "Hide metadata" : "Show metadata"}
      >
        <PanelRight />
      </Button>
    </div>
  );
}

type IssueMainContentProps = {
  id: string;
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
};

function IssueMainContent({
  id,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: IssueMainContentProps) {
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
          Issue details placeholder; add widgets next.
        </p>
      </div>

      <CommentsSection entityId={id as never} />
    </div>
  );
}

type IssueMetadataPanelProps = {
  issue: IssueModel;
};

function IssueMetadataPanel({ issue }: IssueMetadataPanelProps) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <div className="text-xs uppercase text-muted-foreground">ID</div>
        <div className="mt-1 font-medium text-foreground">{issue.id}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Control</div>
        <div className="mt-1 font-medium text-foreground">{issue.controlId ?? "—"}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Type</div>
        <div className="mt-1 font-medium text-foreground">{issue.type ?? "—"}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Status</div>
        <div className="mt-1 font-medium text-foreground">{issue.status ?? "—"}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Severity</div>
        <div className="mt-1 font-medium text-foreground">{issue.severity ?? "—"}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Updated</div>
        <div className="mt-1 font-medium text-foreground">{formatUpdatedAt(issue.updatedAt)}</div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/org/$slug/issue/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const issueState = useAtomValue(getIssueById(id as never));
  const mutate = useAtomSet(updateIssue(), { mode: "promise" });
  const refreshDetail = useAtomRefresh(getIssueById(id as never));
  const refreshList = useAtomRefresh(listIssues(1));

  const issueModel = Result.getOrElse(issueState, () => null);
  const [isMetaOpen, setIsMetaOpen] = React.useState(true);

  const { name, setName, description, setDescription, statusLabel } = useAutosaveFields({
    id: issueModel?.id ?? null,
    name: issueModel?.title,
    description: issueModel?.description,
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
      <IssueHeaderRight
        statusLabel={statusLabel}
        isMetaOpen={isMetaOpen}
        onToggle={() => setIsMetaOpen((value) => !value)}
      />
    ),
    [isMetaOpen, statusLabel],
  );

  useAppHeaderSlots({ right: headerRight }, [headerRight]);

  const issue = issueModel as IssueModel | null;

  if (issueState._tag === "Initial") {
    return <IssueSkeleton />;
  }

  if (Result.isFailure(issueState)) {
    return <FieldDescription>Failed loading issue</FieldDescription>;
  }

  if (!issueModel || !issue) {
    return <FieldDescription>Issue not found</FieldDescription>;
  }

  const mainContent = (
    <IssueMainContent
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
        <MetadataSidebar id="issue-metadata" open={isMetaOpen} onOpenChange={setIsMetaOpen}>
          <IssueMetadataPanel issue={issue} />
        </MetadataSidebar>
      </div>
    </OrgListLayout>
  );
}
