import type { ColumnDef } from "@tanstack/react-table";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Result, useAtomValue } from "@effect-atom/atom-react";

import { DataTable } from "@/features/control/data-table";
import { DataTableColumnHeader } from "@/features/control/data-table-column-header";
import { countControls, listControls } from "@/features/control/_atom";

import React from "react";

type ControlRow = {
  id: string;
  name: string;
  frameworkId: string;
  status: string;
  testingFrequency: string;
  updatedAt: string;
};

const columns: ColumnDef<ControlRow>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => (
      <div className="w-[120px] truncate">{row.getValue("id")}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[520px] truncate font-medium">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "frameworkId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Framework" />
    ),
    cell: ({ row }) => (
      <div className="w-[160px] truncate">{row.getValue("frameworkId")}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <div className="w-[120px] truncate">{row.getValue("status")}</div>
    ),
  },
  {
    accessorKey: "testingFrequency",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Testing" />
    ),
    cell: ({ row }) => (
      <div className="w-[140px] truncate">{row.getValue("testingFrequency")}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated" />
    ),
    cell: ({ row }) => (
      <div className="w-[160px] truncate">{row.getValue("updatedAt")}</div>
    ),
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

export function ListControl({
  frameworkId,
  className,
  ...props
}: React.ComponentProps<"div"> & { frameworkId?: string }) {
  const list = useAtomValue(listControls(1));
  const count = useAtomValue(countControls());

  const total = Result.getOrElse(count, () => 0);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {list._tag === "Initial" || count._tag === "Initial" ? (
        <LoadingSkeleton />
      ) : Result.isFailure(list) || Result.isFailure(count) ? (
        <FieldDescription>Failed loading controls</FieldDescription>
      ) : (Result.getOrElse(list, () => []).length ?? 0) === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No controls</EmptyTitle>
            <EmptyDescription>Create first control to start</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold">Controls</div>
            <div className="text-muted-foreground text-sm">{total} total</div>
          </div>

          <DataTable<ControlRow, unknown>
            columns={columns}
            data={Result.getOrElse(list, () => []).map((c) => ({
              id: c.id,
              name: c.name,
              frameworkId: c.frameworkId,
              status: c.status,
              testingFrequency: c.testingFrequency ?? "",
              updatedAt: String(c.updatedAt),
            }))}
            frameworkId={frameworkId}
            toolbarVariant={frameworkId ? "noFrameworkFilter" : "default"}
          />
        </>
      )}
    </div>
  );
}
