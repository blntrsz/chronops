import { createAuthClient } from "better-auth/react";
import { emailOTPClient, organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_VERCEL_URL
    ? `https://${import.meta.env.VITE_VERCEL_URL}`
    : "http://localhost:3000",
  plugins: [emailOTPClient(), organizationClient()],
});

export type AuthClient = typeof authClient;
