import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useNavigate } from "@tanstack/react-router";
import { GalleryVerticalEnd } from "lucide-react";
import React from "react";
import { authClient } from "./client";

export function OtpForm({ email }: { email: string }) {
  const navigate = useNavigate();
  const otpRef = React.useRef<HTMLInputElement>(null);

  async function login() {
    const otp = otpRef.current?.value ?? "";
    await authClient.signIn.emailOtp({
      email,
      otp,
    });
    navigate({ to: "/org" });
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          e.stopPropagation();

          await login();
        }}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a href="#" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Acme Inc.</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to Acme Inc.</h1>
            <FieldDescription>
              Don&apos;t have an account? <a href="#">Sign up</a>
            </FieldDescription>
          </div>
          <Field>
            <InputOTP ref={otpRef} id="otp" maxLength={6} containerClassName="justify-center">
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </Field>
          <Field>
            <Button type="submit">Login</Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
