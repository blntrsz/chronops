import { auth } from "@chronops/core/auth/server";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

export const getSession = createServerFn().handler(async () => {
  const session = await auth.api.getSession({ headers: getRequestHeaders() });

  return session;
});

export const getActiveOrganization = createServerFn().handler(async () => {
  const headers = getRequestHeaders();

  const session = await auth.api.getSession({ headers });
  const activeOrganizationId = session?.session?.activeOrganizationId;

  if (!activeOrganizationId) return null;

  const organization = await auth.api.getFullOrganization({
    query: { organizationId: activeOrganizationId },
    headers,
  });

  return organization;
});

export const getActor = createServerFn().handler(async () => {
  const headers = getRequestHeaders();

  const session = await auth.api.getSession({ headers });
  const user = session?.user;
  const activeOrganizationId = session?.session.activeOrganizationId;

  if (!user) {
    return {
      type: "anonymous",
      data: null,
    } as const;
  }

  if (!activeOrganizationId) {
    return {
      type: "user",
      data: user,
    } as const;
  }

  try {
    const organization = await auth.api.getFullOrganization({
      query: { organizationId: activeOrganizationId },
      headers,
    });

    return {
      type: "member",
      data: {
        organization,
      },
    } as const;
  } catch (error) {
    console.error(error);

    return {
      type: "user",
      data: user,
    };
  }
});
