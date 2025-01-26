// TableActions.tsx
import * as React from "react";
import { DownloadIcon } from "@radix-ui/react-icons";
import { exportTableToCSV } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "./DataTableFacetedFilter";
import { Filter } from "@/types/tables/select/filterTypes";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table } from "@tanstack/react-table";

interface TableActionsProps<TData> {
  globalFilter: string;
  setGlobalFilter: (filter: string) => void;
  filters: Filter[];
  setFilters: (filters: Filter[]) => void;
  updateFilter: (key: string, values: string[]) => void;
  table: Table<TData>;
  onAction: (action: string, selectedIds: string[]) => void; // Add this prop
  actionOptions: { label: string; value: string }[]; // Add this prop
}

export function TableActions<TData>({
  globalFilter,
  setGlobalFilter,
  filters,
  setFilters,
  updateFilter,
  table,
  onAction,
  actionOptions,
}: TableActionsProps<TData>) {
  const handleFilterChange = (key: string, values: string[]) => {
    console.log("Updating filter for:", key, values);
    updateFilter(key, values);
  };

  const handleAction = (action: string) => {
    const selectedIds = table
      .getRowModel()
      .rows.filter((row) => row.getIsSelected())
      .map((row) => (row.original as { id: string }).id);
    onAction(action, selectedIds);
  };

  return (
    <div className="flex flex-wrap items-start md:items-center py-4 gap-2">
      <div className="flex flex-wrap flex-1 gap-2 md:gap-4">
        <Input
          placeholder="Search..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="w-full md:w-auto"
        />
        <div className="w-full grid grid-cols-2 gap-2 md:flex md:flex-grow md:w-auto">
          {filters.map((filter) => (
            <DataTableFacetedFilter
              key={filter.key}
              title={filter.title}
              options={filter.options}
              selectedValues={filter.selectedValues}
              setSelectedValues={(values) =>
                handleFilterChange(filter.key, values)
              }
              filterKey={filter.key}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
        <Button
          variant="outline"
          size="sm"
          className="w-full md:w-auto"
          onClick={() =>
            exportTableToCSV(table, {
              filename: "students",
              excludeColumns: ["select", "actions"],
            })
          }
        >
          <DownloadIcon className="mr-2 size-4" aria-hidden="true" />
          Export
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full md:w-auto">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full md:w-auto">
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {actionOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                className="capitalize"
                onCheckedChange={() => handleAction(option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
