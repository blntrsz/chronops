import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Result, useAtomValue } from "@effect-atom/atom-react";


import { listFrameworks } from "@/features/framework/_atom";
import { DataTableViewOptions } from "@/features/control/data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  placeholder?: string;
  filterColumnId?: string;
  showFrameworkFilter?: boolean;
}

export function DataTableToolbar<TData>({
  table,
  placeholder = "Filter...",
  filterColumnId = "name",
  showFrameworkFilter = true,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const frameworks = useAtomValue(listFrameworks(1));
  const frameworkOptions = Result.getOrElse(frameworks, () => []);
  const frameworkIdCol = table.getColumn("frameworkId");


  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder={placeholder}
          value={(table.getColumn(filterColumnId)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(filterColumnId)?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {showFrameworkFilter ? (
          <Select
            value={(frameworkIdCol?.getFilterValue() as string | undefined) ?? "__all"}
            onValueChange={(value) => {
              if (!frameworkIdCol) return;
              const nextFrameworkId = value === "__all" ? undefined : value;
              frameworkIdCol.setFilterValue(nextFrameworkId);
            }}
          >
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue placeholder="Framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All frameworks</SelectItem>
              {frameworkOptions.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        {isFiltered ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              table.resetColumnFilters();
            }}
          >
            Reset
            <X />
          </Button>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
