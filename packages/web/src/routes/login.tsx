import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { useState } from "react";

import { authClient } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (session.data?.user) {
      if (session.data.session?.activeOrganizationId)
        throw redirect({ to: "/dashboard" });
      throw redirect({ to: "/org/switcher" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate({ from: "/login" });

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" });
      await navigate({ to: "/otp", search: { email } });
    } catch {
      setMessage({ type: "error", text: "OTP send failed. Retry." });
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
            <CardTitle className="text-2xl text-white">Sign in</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your email. We’ll send a 6-digit code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-300"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-slate-700 bg-slate-900/50 text-white placeholder:text-slate-500 focus:border-cyan-500"
                />
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
                disabled={isLoading}
              >
                {isLoading ? "Sending…" : "Send code"}
              </Button>

              <p className="text-center text-xs text-slate-500">
                By continuing, you agree to our terms.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
