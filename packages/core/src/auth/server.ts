import { betterAuth } from "better-auth";
import { emailOTP, organization } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // TODO: implement email sending
        console.log(`[${type}] OTP for ${email}: ${otp}`);
      },
    }),
    organization({
      async sendInvitationEmail(data) {
        // TODO: implement invitation email
        console.log(`Invitation for ${data.email} to ${data.organization.name}`);
      },
    }),
    tanstackStartCookies(), // must be last
  ],
});

export type Auth = typeof auth;
