import { createFileRoute, redirect } from "@tanstack/react-router";

import { ControlListPage } from "@/features/control/components/ControlListPage";
import { getSession } from "@/features/auth/server";

export const Route = createFileRoute("/controls/")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session?.user) {
      throw redirect({ to: "/login" });
    }
    if (!session.session?.activeOrganizationId) {
      throw redirect({ to: "/org/switcher" });
    }
  },
  component: ControlListPage,
});
