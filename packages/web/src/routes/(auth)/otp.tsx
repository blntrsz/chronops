import { OtpForm } from "@/features/auth/otp-form";
import { createFileRoute } from "@tanstack/react-router";
import { Schema } from "effect";

export const Route = createFileRoute("/(auth)/otp")({
  component: RouteComponent,
  validateSearch: Schema.standardSchemaV1(
    Schema.Struct({
      email: Schema.String,
    }),
  ),
});

function RouteComponent() {
  const { email } = Route.useSearch();

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <OtpForm email={email} />
      </div>
    </div>
  );
}
