import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { ListControl } from "@/features/control/list-control";
import { getFrameworkById } from "@/features/framework/_atom";
import { Result, useAtomValue } from "@effect-atom/atom-react";
import { createFileRoute } from "@tanstack/react-router";

function FrameworkSkeleton() {
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

      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/org/$slug/framework/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const fwk = useAtomValue(getFrameworkById(id as any));

  if (fwk._tag === "Initial") {
    return <FrameworkSkeleton />;
  }

  if (Result.isFailure(fwk)) {
    return <FieldDescription>Failed loading framework</FieldDescription>;
  }

  const model = Result.getOrElse(fwk, () => null);
  if (!model || model._tag !== "Some") {
    return <FieldDescription>Framework not found</FieldDescription>;
  }

  const fwkModel = model.value;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{fwkModel.name}</CardTitle>
          <CardDescription className="space-y-1">
            {fwkModel.version ? <div>v{fwkModel.version}</div> : null}
            {fwkModel.description ? <div>{fwkModel.description}</div> : null}
          </CardDescription>
        </CardHeader>
      </Card>

      <ListControl frameworkId={id} />
    </div>
  );
}
