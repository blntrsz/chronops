import { auth } from "@chronops/core/auth/server";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

export const getSession = createServerFn().handler(async () => {
  const session = await auth.api.getSession({ headers: getRequestHeaders() });

  return session;
});
