import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/features/auth/client";
import { LandingHeader } from "@/widgets/header/landing-header";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck,
  FileText,
  Lock,
  ShieldCheck,
  Workflow,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const session = authClient.useSession();
  const getStartedTo = session.data ? "/org" : "/login";

  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 md:pt-24 lg:pt-32 pb-20">
          <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-background z-0" />
          <div className="relative z-10 px-4 md:px-6">
            <div className="mx-auto flex max-w-4xl flex-col items-center text-center gap-8">
              <Badge variant="secondary" className="px-4 py-1.5 text-sm rounded-full">
                Compliance Management Reimagined
              </Badge>
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-7xl">
                Simplify compliance. <br className="hidden md:inline" />
                <span className="text-primary">Secure your future.</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-[42rem] leading-relaxed">
                Streamline frameworks, controls, documents, and workflows in one unified platform
                designed for modern engineering teams.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button asChild size="lg" className="h-12 px-8 text-base">
                  <Link to={getStartedTo}>
                    Get Started <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                  <Link to="/login">View Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="pb-24 pt-12 px-4 md:px-6">
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<ShieldCheck className="size-8 text-primary" />}
              title="Frameworks"
              description="Organize and map compliance standards like SOC 2, ISO 27001, and HIPAA effortlessly."
            />
            <FeatureCard
              icon={<FileCheck className="size-8 text-primary" />}
              title="Controls"
              description="Track requirements, monitor status, and ensure implementation across your organization."
            />
            <FeatureCard
              icon={<Workflow className="size-8 text-primary" />}
              title="Workflows"
              description="Automate review cycles, approvals, and recurring tasks to stay audit-ready."
            />
          </div>
        </section>

        {/* Value Proposition */}
        <section className="bg-muted/50 py-20">
          <div className="px-4 md:px-6">
            <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-12">
              <div className="max-w-xl space-y-6">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Everything you need to stay compliant
                </h2>
                <p className="text-lg text-muted-foreground">
                  Stop wrestling with spreadsheets. Chronops gives you the tools to manage your
                  compliance program with confidence.
                </p>
                <ul className="space-y-4">
                  {[
                    "Automated evidence collection",
                    "Real-time status dashboards",
                    "Role-based access control",
                    "Audit-ready reporting",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="size-5 text-primary" />
                      <span className="text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mx-auto w-full max-w-xl rounded-2xl border bg-background p-8 shadow-sm">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4 border-b pb-4">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Lock className="size-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Security Review</h3>
                      <p className="text-sm text-muted-foreground">Pending approval</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      High Priority
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 w-3/4 rounded-full bg-muted" />
                    <div className="h-2 w-1/2 rounded-full bg-muted" />
                    <div className="h-2 w-5/6 rounded-full bg-muted" />
                  </div>
                  <div className="grid gap-3 pt-2 sm:grid-cols-2">
                    <Button className="w-full bg-neutral-900 text-white hover:bg-neutral-800">
                      Approve
                    </Button>
                    <Button variant="outline" className="w-full">
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 md:px-6">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-3xl bg-primary/5 border border-primary/10 px-6 py-12 text-center md:px-10">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Ready to streamline your compliance?
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Join engineering teams building trust with Chronops. Start your journey to effortless
              compliance today.
            </p>
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link to={getStartedTo}>Get Started Now</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/30 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 text-sm text-muted-foreground md:flex-row md:px-6">
          <p>© 2024 Chronops. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link to="/" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="h-full border bg-background/60 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="gap-2">
        <div className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
