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
      <Link to="/org/$slug/framework" params={{ slug }}>
        <Card>
          <CardHeader>
            <CardTitle>Frameworks</CardTitle>
            <CardDescription>Manage frameworks</CardDescription>
          </CardHeader>
        </Card>
      </Link>
    </div>
  );
}
