import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, organization } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "../db";

export const auth = betterAuth({
  baseURL: "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        console.log(`[${type}] OTP for ${email}: ${otp}`);
      },
    }),
    organization({
      async sendInvitationEmail(data) {
        console.log(`Invitation for ${data.email} to ${data.organization.name}`);
      },
    }),
    tanstackStartCookies(), // must be last
  ],
});

export type Auth = typeof auth;
