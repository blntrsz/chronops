import { createFileRoute, redirect } from "@tanstack/react-router";

import { getSession } from "@/features/auth/server";

export const Route = createFileRoute("/organizations")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session?.user) throw redirect({ to: "/login" });
    throw redirect({ to: "/org/switcher" });
  },
  component: () => null,
});
