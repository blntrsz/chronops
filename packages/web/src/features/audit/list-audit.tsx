import type { ColumnDef } from "@tanstack/react-table";

import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Result, useAtomValue } from "@effect-atom/atom-react";
import { Link } from "@tanstack/react-router";

import { listAudits } from "@/features/audit/_atom";
import { DataTable } from "@/features/control/data-table";
import { DataTableColumnHeader } from "@/features/control/data-table-column-header";
import { DateTime } from "effect";

import React from "react";
import { AssessmentTemplate } from "@chronops/domain";

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

type AuditRow = {
  id: string;
  name: string;
  status: string;
  assessmentMethodId: string;
  updatedAt: string;
};

const columns = (slug: string): ColumnDef<AuditRow>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <div className="w-[120px] truncate">{row.getValue("id")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <Link
        to="/org/$slug/audit/$id"
        params={{ slug, id: row.getValue("id") as string }}
        className="block max-w-[520px] truncate font-medium hover:underline"
      >
        {row.getValue("name")}
      </Link>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <div className="w-[120px] truncate">{row.getValue("status")}</div>,
  },
  {
    accessorKey: "assessmentMethodId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Assessment" />,
    cell: ({ row }) => (
      <div className="w-[160px] truncate">{row.getValue("assessmentMethodId")}</div>
    ),
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
        to="/org/$slug/audit/$id"
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

export function ListAudit({
  assessmentMethodId,
  className,
  slug,
  ...props
}: React.ComponentProps<"div"> & {
  assessmentMethodId?: AssessmentTemplate.AssessmentTemplateId;
  slug: string;
}) {
  const list = useAtomValue(listAudits(1, assessmentMethodId));
  const cols = React.useMemo(() => columns(slug), [slug]);

  const data = Result.getOrElse(list, () => ({ data: [] as any[], total: 0 }));
  const total = data.total;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {list._tag === "Initial" ? (
        <LoadingSkeleton />
      ) : Result.isFailure(list) ? (
        <FieldDescription>Failed loading audits</FieldDescription>
      ) : data.data.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No audits</EmptyTitle>
            <EmptyDescription>Create first audit to start</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold">Audits</div>
            <div className="text-muted-foreground text-sm">{total} total</div>
          </div>

          <DataTable<AuditRow, unknown>
            columns={cols}
            data={data.data.map((audit: any) => ({
              id: audit.id,
              name: audit.name,
              status: audit.status,
              assessmentMethodId: audit.assessmentMethodId,
              updatedAt: formatUpdatedAt(audit.updatedAt),
            }))}
            toolbarVariant="default"
          />
        </>
      )}
    </div>
  );
}
