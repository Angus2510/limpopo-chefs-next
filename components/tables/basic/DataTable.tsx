import * as React from "react";
import { ColumnDef, flexRender } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableActions } from "./TableActions";
import { useDataTable } from "@/hooks/tables/basic/useDataTable";
import { DataTableColumnHeader } from "./DataTableColumnHeader";
import { PaginationControls } from "./PaginationControls";
import { SearchParamsContext } from "./SearchParamsProvider";
import { Filter } from "@/types/tables/basic/filterTypes";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  filters: Filter[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  filters,
}: DataTableProps<TData, TValue>) {
  const context = React.useContext(SearchParamsContext);

  if (!context) {
    throw new Error(
      "SearchParamsContext must be used within a SearchParamsProvider"
    );
  }

  const { searchParams, setSearchParams } = context;

  const initialSortingColumn = columns.find(
    (
      column
    ): column is ColumnDef<TData, TValue> & { accessorKey: keyof TData } =>
      "accessorKey" in column
  );

  const {
    table,
    // setSorting,
    // setColumnFilters,
    setPageIndex,
    setPageSize,
    globalFilter,
    setGlobalFilter,
    filters: hookFilters,
    setFilters,
    updateFilter,
  } = useDataTable<TData, TValue>({
    data,
    columns,
    pageCount,
    state: {
      sorting: initialSortingColumn
        ? [
            {
              id: initialSortingColumn.accessorKey as Extract<
                keyof TData,
                string
              >,
              desc:
                (searchParams.get("sort")?.split(".")[1] || "asc") === "desc",
            },
          ]
        : [],
    },
    setSearchParams,
    filters,
  });

  return (
    <>
      <div className="flex flex-col gap-4">
        <TableActions
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          filters={hookFilters}
          setFilters={setFilters}
          updateFilter={updateFilter}
          table={table}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <DataTableColumnHeader
                        column={header.column}
                        title={header.column.columnDef.header as string}
                        className=""
                        enableSorting={header.column.columnDef.enableSorting}
                      />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationControls
        table={table}
        pageSizeOptions={[10, 20, 30, 40, 50]}
        setPageSize={setPageSize}
        setPageIndex={setPageIndex}
        pageIndex={table.getState().pagination.pageIndex}
        pageCount={pageCount}
      />
    </>
  );
}
