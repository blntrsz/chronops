import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { useMemo, useState } from "react";

import { authClient } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export const Route = createFileRoute("/(auth)/otp")({
  validateSearch: (search) => {
    const email = typeof search.email === "string" ? search.email : "";
    return { email };
  },
  beforeLoad: async ({ search }) => {
    if (!search.email) throw redirect({ to: "/login" });

    const session = await authClient.getSession();
    if (session.data?.user) {
      if (session.data.session?.activeOrganizationId) {
        const slug = session.data.session.activeOrganizationId;
        throw redirect({ to: "/org/$slug", params: { slug } });
      }
      throw redirect({ to: "/org/switcher" });
    }
  },
  component: OtpPage,
});

function OtpPage() {
  const navigate = useNavigate({ from: "/otp" });
  const { email } = Route.useSearch();
  const session = authClient.useSession();

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const maskedEmail = useMemo(() => {
    const [user, domain] = (email || "").split("@");
    if (!user || !domain) return email;
    return `${user.slice(0, 2)}***@${domain}`;
  }, [email]);

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await authClient.signIn.emailOtp({ email, otp });
      if (session.data?.session?.activeOrganizationId) {
        const slug = session.data.session.activeOrganizationId;
        await navigate({ to: "/org/$slug", params: { slug } });
      } else {
        await navigate({ to: "/org/switcher" });
      }
    } catch {
      setMessage({ type: "error", text: "Invalid code. Retry." });
    } finally {
      setIsLoading(false);
    }
  };

  const onResend = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      await authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" });
      setMessage({ type: "success", text: "Code resent." });
    } catch {
      setMessage({ type: "error", text: "Resend failed. Retry." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="ds-icon-tile">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <Link to="/" className="text-xl font-bold text-white">
            Chronops
          </Link>
        </div>

        <Card className="ds-glass">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-white">Enter code</CardTitle>
            <CardDescription className="text-slate-400">
              Sent to{" "}
              <span className="font-medium text-slate-300">{maskedEmail}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onVerify} className="space-y-4">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {message ? (
                <Alert
                  variant={
                    message.type === "success" ? "default" : "destructive"
                  }
                >
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              ) : null}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? "Verifying…" : "Verify"}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-slate-300"
                  asChild
                >
                  <Link to="/login">Change email</Link>
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-slate-300"
                  onClick={onResend}
                  disabled={isLoading}
                >
                  Resend
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
