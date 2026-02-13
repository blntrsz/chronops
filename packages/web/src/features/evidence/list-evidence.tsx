import type { ColumnDef } from "@tanstack/react-table";

import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Result, useAtomValue } from "@effect-atom/atom-react";
import { Link } from "@tanstack/react-router";

import { listEvidence } from "@/features/evidence/_atom";
import { DataTable } from "@/features/control/data-table";
import { DataTableColumnHeader } from "@/features/control/data-table-column-header";
import { DateTime } from "effect";

import React from "react";
import { Control, Pdf } from "@chronops/domain";

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

type EvidenceRow = {
  id: string;
  title: string;
  sourceType: string;
  status: string;
  controlId: string;
  updatedAt: string;
};

const columns = (slug: string): ColumnDef<EvidenceRow>[] => [
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
        to="/org/$slug/evidence/$id"
        params={{ slug, id: row.getValue("id") as string }}
        className="block max-w-[520px] truncate font-medium hover:underline"
      >
        {row.getValue("title")}
      </Link>
    ),
  },
  {
    accessorKey: "sourceType",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Source" />,
    cell: ({ row }) => <div className="w-[120px] truncate">{row.getValue("sourceType")}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <div className="w-[120px] truncate">{row.getValue("status")}</div>,
  },
  {
    accessorKey: "controlId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Control" />,
    cell: ({ row }) => <div className="w-[160px] truncate">{row.getValue("controlId")}</div>,
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
        to="/org/$slug/evidence/$id"
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

type ListEvidenceFilter = {
  controlId?: Control.ControlId;
  pdfId?: Pdf.PdfId;
};

export function ListEvidence({
  filter,
  className,
  slug,
  ...props
}: React.ComponentProps<"div"> & { filter?: ListEvidenceFilter; slug: string }) {
  const list = useAtomValue(listEvidence(1, filter));
  const cols = React.useMemo(() => columns(slug), [slug]);

  const data = Result.getOrElse(list, () => ({ data: [] as any[], total: 0 }));
  const total = data.total;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {list._tag === "Initial" ? (
        <LoadingSkeleton />
      ) : Result.isFailure(list) ? (
        <FieldDescription>Failed loading evidence</FieldDescription>
      ) : data.data.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No evidence</EmptyTitle>
            <EmptyDescription>Create first evidence to start</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold">Evidence</div>
            <div className="text-muted-foreground text-sm">{total} total</div>
          </div>

          <DataTable<EvidenceRow, unknown>
            columns={cols}
            data={data.data.map((evidence: any) => ({
              id: evidence.id,
              title: evidence.title,
              sourceType: evidence.sourceType,
              status: evidence.status,
              controlId: evidence.controlId ?? "",
              updatedAt: formatUpdatedAt(evidence.updatedAt),
            }))}
            toolbarVariant="default"
            filterColumnId="title"
            filterPlaceholder="Filter evidence..."
          />
        </>
      )}
    </div>
  );
}
