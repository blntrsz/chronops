import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { FrameworkSummary } from "@chronops/domain";
import { Link, useParams } from "@tanstack/react-router";
import { AlertTriangle, CircleDot, ClipboardCheck, Shield } from "lucide-react";

interface FrameworkDashboardCardProps {
  summary: FrameworkSummary.FrameworkSummary;
}

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

function statusBadgeVariant(status: string) {
  switch (status) {
    case "active":
      return "default" as const;
    case "draft":
      return "secondary" as const;
    case "archived":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
}

export function FrameworkDashboardCard({ summary }: FrameworkDashboardCardProps) {
  const { slug } = useParams({ from: "/org/$slug/framework/" });
  const s = summary;

  return (
    <Link to="/org/$slug/framework/$id" params={{ slug, id: s.id }} className="block group">
      <Card className="hover:shadow-md transition-shadow h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary shrink-0" />
            <CardTitle className="line-clamp-1">{s.name}</CardTitle>
          </div>
          <CardDescription className="flex items-center gap-2">
            <Badge variant={statusBadgeVariant(s.status)} className="text-[10px]">
              {s.status}
            </Badge>
            {s.version ? <span className="text-xs text-muted-foreground">v{s.version}</span> : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {s.description ? (
            <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>
          ) : null}

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {s.activeControls} of {s.totalControls} controls
              </span>
              <span className={cn("font-medium", progressColor(s.completionPct))}>
                {s.completionPct}%
              </span>
            </div>
            <Progress
              value={s.completionPct}
              className={cn("h-2 bg-muted", progressBarClass(s.completionPct))}
            />
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
            <StatIndicator
              icon={AlertTriangle}
              count={s.unmanagedRisks}
              label="risks"
              severity={s.unmanagedRisks > 0 ? "destructive" : "muted"}
            />
            <StatIndicator
              icon={CircleDot}
              count={s.openIssues}
              label="issues"
              severity={s.openIssues > 0 ? "warning" : "muted"}
            />
            <StatIndicator
              icon={ClipboardCheck}
              count={s.linkedAudits}
              label={s.linkedAudits === 1 ? "audit" : "audits"}
              severity="muted"
              tag={s.hasUpcomingAudit ? "upcoming" : undefined}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function StatIndicator({
  icon: Icon,
  count,
  label,
  severity,
  tag,
}: {
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  label: string;
  severity: "destructive" | "warning" | "muted";
  tag?: string;
}) {
  const colorClass =
    severity === "destructive"
      ? "text-red-500"
      : severity === "warning"
        ? "text-amber-500"
        : "text-muted-foreground";

  return (
    <span className={cn("inline-flex items-center gap-1", colorClass)}>
      <Icon className="h-3.5 w-3.5" />
      <span>
        {count} {label}
      </span>
      {tag ? (
        <Badge
          variant="outline"
          className="text-[10px] px-1 py-0 h-4 text-green-600 border-green-300"
        >
          {tag}
        </Badge>
      ) : null}
    </span>
  );
}
