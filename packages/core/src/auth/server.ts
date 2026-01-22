import { betterAuth } from "better-auth";
import { emailOTP, organization } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { Pool } from "pg";

const vercelURL = process.env.VERCEL_URL;
const baseURL = process.env.BETTER_AUTH_URL
  ? process.env.BETTER_AUTH_URL
  : vercelURL
    ? `https://${vercelURL}`
    : "http://localhost:3000";

export const auth = betterAuth({
  baseURL,
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ...(vercelURL ? [`https://${vercelURL}`] : []),
  ],
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        console.log(`[${type}] OTP for ${email}: ${otp}`);
      },
    }),
    organization({
      async sendInvitationEmail(data) {
        console.log(
          `Invitation for ${data.email} to ${data.organization.name}`,
        );
      },
    }),
    tanstackStartCookies(), // must be last
  ],
});

export type Auth = typeof auth;
