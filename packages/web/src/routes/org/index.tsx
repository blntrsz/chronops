import { CreateOrg } from "@/features/auth/create-org";
import { ListOrgs } from "@/features/auth/list-orgs";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/org/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="text-lg font-medium">Organizations</div>
        <CreateOrg />
      </div>
      <ListOrgs />
    </div>
  );
}
