import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { listFrameworkSummaries } from "@/features/framework/_atom";
import { cn } from "@/lib/utils";
import { Result, useAtomValue } from "@effect-atom/atom-react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Activity, AlertTriangle, CircleDot, Shield } from "lucide-react";

export const Route = createFileRoute("/org/$slug/")({
  component: RouteComponent,
});

function progressColor(pct: number) {
  if (pct >= 80) return "text-green-500";
  if (pct >= 50) return "text-amber-500";
  return "text-red-500";
}

function progressBarClass(pct: number) {
  if (pct >= 80) return "[&>[data-slot=progress-indicator]]:bg-green-500";
  if (pct >= 50) return "[&>[data-slot=progress-indicator]]:bg-amber-500";
  return "[&>[data-slot=progress-indicator]]:bg-red-500";
}

function RouteComponent() {
  const { slug } = Route.useParams();
  const summariesResult = useAtomValue(listFrameworkSummaries());

  const summaries = Result.getOrElse(summariesResult, () => []);
  const isLoading = summariesResult._tag === "Initial";
  const isError = Result.isFailure(summariesResult);

  // Computed aggregate stats
  const activeFrameworks = summaries.filter((s) => s.status === "active");
  const avgCompletion =
    activeFrameworks.length > 0
      ? Math.round(
          activeFrameworks.reduce((sum, s) => sum + s.completionPct, 0) / activeFrameworks.length,
        )
      : 0;
  const totalUnmanagedRisks = summaries.reduce((sum, s) => sum + s.unmanagedRisks, 0);
  const totalOpenIssues = summaries.reduce((sum, s) => sum + s.openIssues, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your organization's compliance posture.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Compliance Score"
          value={isLoading ? undefined : `${avgCompletion}%`}
          description={`Avg across ${activeFrameworks.length} active framework${activeFrameworks.length !== 1 ? "s" : ""}`}
          icon={Activity}
          color="text-green-500"
        />
        <StatCard
          title="Active Frameworks"
          value={isLoading ? undefined : String(activeFrameworks.length)}
          description={
            activeFrameworks.length > 0
              ? activeFrameworks.map((f) => f.name).join(", ")
              : "No active frameworks"
          }
          icon={Shield}
          color="text-blue-500"
        />
        <StatCard
          title="Unmanaged Risks"
          value={isLoading ? undefined : String(totalUnmanagedRisks)}
          description="Open risks without treatment"
          icon={AlertTriangle}
          color={totalUnmanagedRisks > 0 ? "text-red-500" : "text-green-500"}
        />
        <StatCard
          title="Open Issues"
          value={isLoading ? undefined : String(totalOpenIssues)}
          description="Across all frameworks"
          icon={CircleDot}
          color={totalOpenIssues > 0 ? "text-amber-500" : "text-green-500"}
        />
      </div>

      {/* Framework Progress */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Framework Progress</CardTitle>
          <CardDescription>Completion status across frameworks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))
          ) : isError ? (
            <p className="text-sm text-muted-foreground">Failed to load frameworks.</p>
          ) : summaries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No frameworks yet.{" "}
              <Link to="/org/$slug/framework" params={{ slug }} className="text-primary underline">
                Create one
              </Link>
            </p>
          ) : (
            summaries.map((s) => (
              <Link
                key={s.id}
                to="/org/$slug/framework/$id"
                params={{ slug, id: s.id }}
                className="block group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="font-medium group-hover:text-primary transition-colors">
                        {s.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {s.activeControls}/{s.totalControls} controls
                      </span>
                    </div>
                    <span className={cn("font-medium", progressColor(s.completionPct))}>
                      {s.completionPct}%
                    </span>
                  </div>
                  <Progress
                    value={s.completionPct}
                    className={cn("h-2 bg-muted", progressBarClass(s.completionPct))}
                  />
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | undefined;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", color)} />
      </CardHeader>
      <CardContent>
        {value !== undefined ? (
          <div className="text-2xl font-bold">{value}</div>
        ) : (
          <Skeleton className="h-8 w-16" />
        )}
        <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
      </CardContent>
    </Card>
  );
}
