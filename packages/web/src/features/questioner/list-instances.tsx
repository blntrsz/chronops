import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { listQuestionerInstances } from "@/features/questioner/_atom";
import { cn } from "@/lib/utils";
import { Result, useAtomValue } from "@effect-atom/atom-react";
import { Link, useParams } from "@tanstack/react-router";
import React from "react";

export function ListQuestionerInstances({
  className,
  templateId,
  ...props
}: React.ComponentProps<"div"> & {
  templateId?: string;
}) {
  const { slug } = useParams({ from: "/org/$slug/assessment/questioner/$id" });
  const list = useAtomValue(
    listQuestionerInstances(1, {
      templateId: templateId as never,
    }),
  );

  if (list._tag === "Initial") {
    return (
      <div className={cn("flex flex-col gap-4", className)} {...props}>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (Result.isFailure(list)) {
    return <FieldDescription>Failed loading instances</FieldDescription>;
  }

  const data = Result.getOrElse(list, () => ({ data: [] as any[] })).data;

  if (data.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No instances</EmptyTitle>
          <EmptyDescription>Create first instance to run questioner</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      {data.map((instance) => (
        <Link
          key={instance.id}
          to="/org/$slug/assessment/questioner-instance/$id"
          params={{ slug, id: instance.id }}
          className="rounded-lg border p-4 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="font-medium truncate">{instance.name}</div>
            <div className="text-xs text-muted-foreground">{instance.workflowStatus}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
