import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { getDocumentById } from "@/features/document/_atom";
import { Result, useAtomValue } from "@effect-atom/atom-react";
import { Link, createFileRoute } from "@tanstack/react-router";

function DocumentSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-1/2" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardHeader>
      </Card>

      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export const Route = createFileRoute("/org/$slug/document/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id, slug } = Route.useParams();
  const doc = useAtomValue(getDocumentById(id as any));

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

  const document = model.value;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to="/org/$slug/document"
          params={{ slug }}
          className="text-sm text-muted-foreground hover:underline"
        >
          Back to documents
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{document.name}</CardTitle>
          <CardDescription className="space-y-1">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <div className="text-muted-foreground">ID: {document.id}</div>
              <div className="text-muted-foreground">Type: {document.type}</div>
              {document.size ? (
                <div className="text-muted-foreground">
                  Size: {document.size.toLocaleString()} bytes
                </div>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {document.frameworkId ? (
                <div className="text-muted-foreground">Framework: {document.frameworkId}</div>
              ) : null}
              {document.controlId ? (
                <div className="text-muted-foreground">Control: {document.controlId}</div>
              ) : null}
            </div>
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Link</CardTitle>
          <CardDescription className="break-all">
            <a href={document.url} target="_blank" rel="noreferrer" className="underline">
              {document.url}
            </a>
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit</CardTitle>
          <CardDescription>TODO: edit/delete UI next.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
