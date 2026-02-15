import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { listFrameworkSummaries } from "@/features/framework/_atom";
import { CreateFramework } from "@/features/framework/create-framework";
import { FrameworkDashboardCard } from "@/features/framework/framework-dashboard-card";
import { cn } from "@/lib/utils";
import { Result, useAtomValue } from "@effect-atom/atom-react";

import type React from "react";

function FrameworkCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-2/3" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-10" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ListFrameworks({ className, ...props }: React.ComponentProps<"div">) {
  const summaries = useAtomValue(listFrameworkSummaries());

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-row justify-end">
        <CreateFramework />
      </div>

      <FieldGroup>
        {summaries._tag === "Initial" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <FrameworkCardSkeleton key={idx} />
            ))}
          </div>
        ) : Result.isFailure(summaries) ? (
          <FieldDescription>Failed loading frameworks</FieldDescription>
        ) : Result.getOrElse(summaries, () => []).length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No frameworks</EmptyTitle>
              <EmptyDescription>Create first framework to start</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {Result.getOrElse(summaries, () => []).map((summary) => (
              <FrameworkDashboardCard key={summary.id} summary={summary} />
            ))}
          </div>
        )}
      </FieldGroup>
    </div>
  );
}
