import { createFileRoute, redirect } from "@tanstack/react-router";

import { getSession } from "@/features/auth/server";

export const Route = createFileRoute("/org/$slug")({
  beforeLoad: async ({ params }) => {
    const session = await getSession();
    if (!session?.user) throw redirect({ to: "/login" });

    void params;
    // TODO org auth/active switch; not wired
    return session;
  },
});
