import { authClient } from "@/features/auth/client";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import * as React from "react";

export function OrgRouteRedirect() {
  const navigate = useNavigate();
  const location = useRouterState({ select: (s) => s.location });
  const activeOrg = authClient.useActiveOrganization();

  React.useEffect(() => {
    if (location.pathname !== "/org") return;
    const slug = activeOrg.data?.slug;
    if (!slug) return;

    navigate({ to: "/org/$slug", params: { slug }, replace: true });
  }, [activeOrg.data?.slug, location.pathname, navigate]);

  return null;
}
