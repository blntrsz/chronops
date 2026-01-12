import { ListControl } from "@/features/control/list-control";
import { createFileRoute } from "@tanstack/react-router";
import { Schema } from "effect";

export const Route = createFileRoute("/org/$slug/control/")({
  component: RouteComponent,
  validateSearch: Schema.standardSchemaV1(
    Schema.Struct({
      frameworkId: Schema.optional(Schema.String),
    }),
  ),
});

function RouteComponent() {
  const { frameworkId } = Route.useSearch();

  return <ListControl frameworkId={frameworkId} />;
}

