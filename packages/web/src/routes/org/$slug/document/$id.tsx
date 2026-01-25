import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { Sidebar, SidebarContent, SidebarHeader, SidebarSeparator } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { CommentsSection } from "@/features/comment/comments-section";
import { getDocumentById } from "@/features/document/_atom";
import { cn } from "@/lib/utils";
import { useAppHeaderSlots } from "@/widgets/header/app-header-slots";
import { OrgListLayout } from "@/widgets/layout/org-list-layout";
import { Result, useAtomValue } from "@effect-atom/atom-react";
import { createFileRoute } from "@tanstack/react-router";
import { PanelRight } from "lucide-react";
import React from "react";

function DocumentSkeleton() {
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

type DocumentModel = {
  id: string;
  name: string;
  type?: string | null;
  size?: number | null;
  url: string;
  frameworkId?: string | null;
  controlId?: string | null;
};

type DocumentHeaderRightProps = {
  isMetaOpen: boolean;
  onToggle: () => void;
};

function DocumentHeaderRight({ isMetaOpen, onToggle }: DocumentHeaderRightProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onToggle}
        aria-expanded={isMetaOpen}
        aria-controls="document-metadata"
        aria-label={isMetaOpen ? "Hide metadata" : "Show metadata"}
      >
        <PanelRight />
      </Button>
    </div>
  );
}

type DocumentMainContentProps = {
  documentId: string;
  url: string;
};

function DocumentMainContent({ documentId, url }: DocumentMainContentProps) {
  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Link</h2>
        <a href={url} target="_blank" rel="noreferrer" className="break-all underline">
          {url}
        </a>
      </div>

      <CommentsSection entityId={documentId as never} />
    </div>
  );
}

type DocumentMetadataPanelProps = {
  document: DocumentModel;
};

function DocumentMetadataPanel({ document }: DocumentMetadataPanelProps) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <div className="text-xs uppercase text-muted-foreground">ID</div>
        <div className="mt-1 font-medium text-foreground">{document.id}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Type</div>
        <div className="mt-1 font-medium text-foreground">{document.type ?? "—"}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Size</div>
        <div className="mt-1 font-medium text-foreground">
          {document.size ? `${document.size.toLocaleString()} bytes` : "—"}
        </div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Framework</div>
        <div className="mt-1 font-medium text-foreground">{document.frameworkId ?? "—"}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground">Control</div>
        <div className="mt-1 font-medium text-foreground">{document.controlId ?? "—"}</div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/org/$slug/document/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const doc = useAtomValue(getDocumentById(id as never));
  const [isMetaOpen, setIsMetaOpen] = React.useState(true);

  const headerRight = React.useMemo(
    () => (
      <DocumentHeaderRight
        isMetaOpen={isMetaOpen}
        onToggle={() => setIsMetaOpen((value) => !value)}
      />
    ),
    [isMetaOpen],
  );

  useAppHeaderSlots({ right: headerRight }, [headerRight]);

  if (doc._tag === "Initial") {
    return <DocumentSkeleton />;
  }

  if (Result.isFailure(doc)) {
    return <FieldDescription>Failed loading document</FieldDescription>;
  }

  const model = Result.getOrElse(doc, () => null);
  if (!model || model._tag !== "Some") {
    return <FieldDescription>Document not found</FieldDescription>;
  }

  const document = model.value as DocumentModel;

  const mainContent = <DocumentMainContent documentId={id} url={document.url} />;

  return (
    <OrgListLayout
      title={
        <div className="space-y-2">
          <div className="text-2xl font-semibold">{document.name}</div>
          <div className="text-sm text-muted-foreground">{document.type ?? "Document"}</div>
        </div>
      }
      action={null}
      className="gap-0 pr-0"
    >
      <div className="relative flex min-h-[calc(100vh-140px)] flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-0">
        <div className="min-w-0 flex-1">{mainContent}</div>
        <Sidebar
          id="document-metadata"
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
              <DocumentMetadataPanel document={document} />
            </SidebarContent>
          </div>
        </Sidebar>
      </div>
    </OrgListLayout>
  );
}
