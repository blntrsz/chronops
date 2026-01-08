import { createFileRoute, redirect } from "@tanstack/react-router";

import { DocumentListPage } from "@/features/document/components/DocumentListPage";
import { getSession } from "@/features/auth/server";

export const Route = createFileRoute("/documents/")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session?.user) {
      throw redirect({ to: "/login" });
    }
    if (!session?.session?.activeOrganizationId) {
      throw redirect({ to: "/org/switcher" });
    }
  },
  component: DocumentListPage,
});
