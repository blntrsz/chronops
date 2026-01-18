import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { getControlById } from "@/features/control/_atom";
import { Result, useAtomValue } from "@effect-atom/atom-react";
import { createFileRoute } from "@tanstack/react-router";

function ControlSkeleton() {
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>

      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export const Route = createFileRoute("/org/$slug/control/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const ctrl = useAtomValue(getControlById(id as any));

  if (ctrl._tag === "Initial") {
    return <ControlSkeleton />;
  }

  if (Result.isFailure(ctrl)) {
    return <FieldDescription>Failed loading control</FieldDescription>;
  }

  const model = Result.getOrElse(ctrl, () => null);
  if (!model || model._tag !== "Some") {
    return <FieldDescription>Control not found</FieldDescription>;
  }

  const control = model.value;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{control.name}</CardTitle>
          <CardDescription className="space-y-1">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <div className="text-muted-foreground">ID: {control.id}</div>
              <div className="text-muted-foreground">Framework: {control.frameworkId}</div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {control.status ? <div>Status: {control.status}</div> : null}
              {control.testingFrequency ? <div>Testing: {control.testingFrequency}</div> : null}
            </div>
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Status</CardDescription>
            <CardTitle className="text-2xl">{control.status ?? "—"}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Testing frequency</CardDescription>
            <CardTitle className="text-2xl">{control.testingFrequency ?? "—"}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Updated</CardDescription>
            <CardTitle className="text-2xl">{String(control.updatedAt ?? "—")}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>
            Minimal control dashboard placeholder; add widgets next.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
