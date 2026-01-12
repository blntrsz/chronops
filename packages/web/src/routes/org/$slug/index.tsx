import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/org/$slug/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Link to="/org/$slug/framework" params={{ slug }}>
          <Card>
            <CardHeader>
              <CardTitle>Frameworks</CardTitle>
              <CardDescription>Manage frameworks</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/org/$slug/control" params={{ slug }}>
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
              <CardDescription>Manage controls</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
