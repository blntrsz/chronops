import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Lock, Shield, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/features/auth/server";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const session = await getSession();
    if (session?.user) {
      const activeOrgId = session.session?.activeOrganizationId;
      if (activeOrgId) throw redirect({ to: "/dashboard" });
      throw redirect({ to: "/org/switcher" });
    }
  },
  component: LandingPage,
});

function LandingPage() {
  return (
    <>
      <nav className="ds-topbar">
        <div className="flex items-center gap-2">
          <div className="ds-icon-tile">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Chronops</span>
        </div>

        <Button
          asChild
          variant="ghost"
          className="text-slate-300 hover:text-white"
        >
          <Link to="/login">Sign In</Link>
        </Button>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Compliance simplified
            </h1>
            <p className="mt-6 text-lg text-slate-300">
              Streamline frameworks, controls, and evidence management. Stay
              audit-ready with a clean workflow.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-cyan-400" />
                <span className="text-slate-300">
                  Framework mapping & control libraries
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-cyan-400" />
                <span className="text-slate-300">
                  Evidence collection + doc tracking
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-cyan-400" />
                <span className="text-slate-300">
                  Real-time compliance posture
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
              >
                <Link to="/login">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-slate-300"
              >
                <Link to="/login">Request Demo</Link>
              </Button>
            </div>
          </div>

          <Card className="ds-glass rounded-xl">
            <CardHeader>
              <CardTitle className="text-white">
                Built for audit-ready teams
              </CardTitle>
              <CardDescription className="text-slate-400">
                Clear structure, minimal clicks, and fast navigation.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Zap,
              title: "Fast Setup",
              description:
                "Set up in minutes, not hours. Start with templates and grow from there.",
            },
            {
              icon: Lock,
              title: "Secure by Default",
              description: "Role-based access control and modern auth flows.",
            },
            {
              icon: Shield,
              title: "Audit Ready",
              description: "Generate reports and evidence packs quickly.",
            },
          ].map((feature) => (
            <Card
              key={feature.title}
              className="border-slate-700/50 bg-slate-800/30 backdrop-blur-sm"
            >
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10">
                  <feature.icon className="h-6 w-6 text-cyan-400" />
                </div>
                <CardTitle className="text-white">{feature.title}</CardTitle>
                <CardDescription className="text-slate-400">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>

      <footer className="mt-24 border-t border-slate-800 bg-slate-900/50 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-slate-500 sm:px-6 lg:px-8">
          <p>&copy; 2025 Chronops. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
