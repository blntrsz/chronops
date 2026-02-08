import { CreateControl } from "@/features/control/create-control";
import { CreateFramework } from "@/features/framework/create-framework";
import { CreatePolicy } from "@/features/policy/create-policy";
import { authClient } from "@/features/auth/client";
import { OrgShell } from "@/widgets/sidebar/org-shell";
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/org/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const activeOrg = authClient.useActiveOrganization();
  const [setting, setSetting] = React.useState(false);

  React.useEffect(() => {
    if (setting) return;
    if (activeOrg.isPending) return;
    if (activeOrg.data?.slug === slug) return;

    setSetting(true);
    authClient.organization
      .setActive({ organizationSlug: slug })
      .catch(() => navigate({ to: "/org", replace: true }))
      .finally(() => setSetting(false));
  }, [activeOrg.data?.slug, activeOrg.isPending, navigate, setting, slug]);

  if (activeOrg.isPending || setting || activeOrg.data?.slug !== slug) {
    return null;
  }

  return (
    <OrgShell>
      <CreateFramework />
      <CreateControl />
      <CreatePolicy />
      <Outlet />
    </OrgShell>
  );
}
