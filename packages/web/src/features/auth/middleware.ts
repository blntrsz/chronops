import { auth } from "@chronops/core/auth/server";
import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) {
    throw redirect({ to: "/login" });
  }
  return await next();
});

export const organizationMiddleware = createMiddleware().server(async ({ next, request }) => {
  const headers = getRequestHeaders();
  const organization = await auth.api.getFullOrganization({ headers });

  if (organization && new URL(request.url).pathname === "/org") {
    throw redirect({
      to: "/org/$slug",
      params: { slug: organization.slug },
    });
  }

  if (organization) {
    return await next();
  }

  const organizations = await auth.api.listOrganizations({ headers });

  const firstOrganization = organizations.at(0);

  if (firstOrganization) {
    throw redirect({
      to: "/org/$slug",
      params: { slug: firstOrganization.slug },
    });
  }

  const pathname = new URL(request.url).pathname;

  if (pathname !== "/org/create") {
    throw redirect({ to: "/org/create" });
  }

  return await next();
});
