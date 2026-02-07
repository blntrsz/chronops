import type { ColumnDef } from "@tanstack/react-table";

import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Result, useAtomValue } from "@effect-atom/atom-react";
import { Link } from "@tanstack/react-router";

import { listIssues } from "@/features/issue/_atom";
import { DataTable } from "@/features/control/data-table";
import { DataTableColumnHeader } from "@/features/control/data-table-column-header";
import { DateTime } from "effect";

import React from "react";
import { Control } from "@chronops/domain";

const updatedAtFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatUpdatedAt(value: unknown) {
  if (value == null) return "—";
  try {
    if (DateTime.isDateTime(value)) {
      return DateTime.formatIntl(value, updatedAtFormat);
    }

    if (value instanceof Date) {
      return DateTime.formatIntl(DateTime.unsafeMake(value), updatedAtFormat);
    }

    if (typeof value === "string" || typeof value === "number") {
      return DateTime.formatIntl(DateTime.unsafeMake(value), updatedAtFormat);
    }

    return String(value);
  } catch {
    return String(value);
  }
}

type IssueRow = {
  id: string;
  title: string;
  type: string;
  status: string;
  severity: string;
  updatedAt: string;
};

const columns = (slug: string): ColumnDef<IssueRow>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <div className="w-[120px] truncate">{row.getValue("id")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    cell: ({ row }) => (
      <Link
        to="/org/$slug/issue/$id"
        params={{ slug, id: row.getValue("id") as string }}
        className="block max-w-[520px] truncate font-medium hover:underline"
      >
        {row.getValue("title")}
      </Link>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => <div className="w-[120px] truncate">{row.getValue("type")}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <div className="w-[120px] truncate">{row.getValue("status")}</div>,
  },
  {
    accessorKey: "severity",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Severity" />,
    cell: ({ row }) => <div className="w-[120px] truncate">{row.getValue("severity")}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
    cell: ({ row }) => <div className="w-[160px] truncate">{row.getValue("updatedAt")}</div>,
  },
  {
    id: "open",
    header: () => null,
    cell: ({ row }) => (
      <Link
        to="/org/$slug/issue/$id"
        params={{ slug, id: row.getValue("id") as string }}
        className="text-sm text-muted-foreground hover:underline"
      >
        Open
      </Link>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function ListIssue({
  controlId,
  className,
  slug,
  ...props
}: React.ComponentProps<"div"> & { controlId?: Control.ControlId; slug: string }) {
  const list = useAtomValue(listIssues(1, controlId));
  const cols = React.useMemo(() => columns(slug), [slug]);

  const data = Result.getOrElse(list, () => ({ data: [] as any[], total: 0 }));
  const total = data.total;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {list._tag === "Initial" ? (
        <LoadingSkeleton />
      ) : Result.isFailure(list) ? (
        <FieldDescription>Failed loading issues</FieldDescription>
      ) : data.data.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No issues</EmptyTitle>
            <EmptyDescription>Create first issue to start</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold">Issues</div>
            <div className="text-muted-foreground text-sm">{total} total</div>
          </div>

          <DataTable<IssueRow, unknown>
            columns={cols}
            data={data.data.map((issue: any) => ({
              id: issue.id,
              title: issue.title,
              type: issue.type,
              status: issue.status,
              severity: issue.severity ?? "",
              updatedAt: formatUpdatedAt(issue.updatedAt),
            }))}
            toolbarVariant={"default"}
          />
        </>
      )}
    </div>
  );
}
