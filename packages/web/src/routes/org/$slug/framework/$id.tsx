import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldDescription } from "@/components/ui/field";
import { ListControl } from "@/features/control/list-control";
import { getFrameworkById } from "@/features/framework/_atom";
import { Result, useAtomValue } from "@effect-atom/atom-react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/org/$slug/framework/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const fwk = useAtomValue(getFrameworkById(id as any));

  if (fwk._tag === "Initial") {
    return <FieldDescription>Loading...</FieldDescription>;
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
