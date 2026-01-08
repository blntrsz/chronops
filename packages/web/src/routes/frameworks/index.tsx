import { createFileRoute, redirect } from "@tanstack/react-router";

import { FrameworkListPage } from "@/features/framework/components/FrameworkListPage";
import { getSession } from "@/features/auth/server";

export const Route = createFileRoute("/frameworks/")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session?.user) {
      throw redirect({ to: "/login" });
    }
    if (!session.session?.activeOrganizationId) {
      throw redirect({ to: "/org/switcher" });
    }
  },
  component: FrameworkListPage,
});
