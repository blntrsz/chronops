import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { listAssessmentTemplates } from "@/features/assessment/_atom";
import { cn } from "@/lib/utils";
import { Result, useAtomValue } from "@effect-atom/atom-react";
import { Link, useParams } from "@tanstack/react-router";
import React from "react";

function TemplateCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
    </Card>
  );
}

export function ListAssessmentTemplates({
  className,
  controlId,
  ...props
}: React.ComponentProps<"div"> & { controlId?: string }) {
  const [page] = React.useState(1);
  const { slug } = useParams({ from: "/org/$slug/assessment" });

  const list = useAtomValue(listAssessmentTemplates(page, controlId as never));

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {list._tag === "Initial" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <TemplateCardSkeleton key={idx} />
          ))}
        </div>
      ) : Result.isFailure(list) ? (
        <FieldDescription>Failed loading assessments</FieldDescription>
      ) : (Result.getOrElse(list, () => ({ data: [] as any[] })).data.length ?? 0) === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No assessment templates</EmptyTitle>
            <EmptyDescription>Create first template to start</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Result.getOrElse(list, () => ({ data: [] as any[] })).data.map((t) => (
            <Link
              key={t.id}
              to="/org/$slug/assessment/$id"
              params={{ slug, id: t.id }}
              className="block"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{t.name}</CardTitle>
                  <CardDescription className="space-y-1">
                    {t.description ? <div className="line-clamp-2">{t.description}</div> : null}
                    <div className="text-xs text-muted-foreground">control {t.controlId}</div>
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
