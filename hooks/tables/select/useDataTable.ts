import * as React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type TableState,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { z } from 'zod';
import { useDebounce } from '@/hooks/tables/basic/useDebounce';

interface Filter {
  title: string;
  options: { id: string; title: string }[];
  selectedValues: string[];
  key: string;
}

interface UseDataTableProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  pageCount: number;
  state?: Omit<Partial<TableState>, 'sorting'> & {
    sorting?: {
      id: Extract<keyof TData, string>;
      desc: boolean;
    }[];
  };
  setSearchParams: (params: URLSearchParams) => void;
  filters: Filter[];
  setFilters?: React.Dispatch<React.SetStateAction<Filter[]>>;
}

const searchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().optional(),
  sort: z.string().optional(),
  search: z.string().optional(),
});

export function useDataTable<TData, TValue>({
  data,
  columns,
  pageCount,
  state,
  setSearchParams,
  filters: initialFilters,
}: UseDataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { page, per_page, sort, search } = searchParamsSchema.parse(
    Object.fromEntries(searchParams)
  );

  const defaultColumn = React.useMemo(
    () =>
      String(
        (columns[0] as ColumnDef<TData, TValue> & { accessorKey: keyof TData })
          .accessorKey
      ) || 'id',
    [columns]
  );

  const [column, order] = (sort ?? `${defaultColumn}.asc`).split('.') as [
    string,
    'asc' | 'desc'
  ];

  const [sorting, setSorting] = React.useState<SortingState>(
    state?.sorting ?? [{ id: column || defaultColumn, desc: order === 'desc' }]
  );

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    state?.columnFilters ?? []
  );

  const [pageIndex, setPageIndex] = React.useState(page - 1);
  const [pageSize, setPageSize] = React.useState(per_page ?? 10);
  const [globalFilter, setGlobalFilter] = React.useState(search || '');

  const debouncedColumnFilters = useDebounce(columnFilters, 500);
  const debouncedGlobalFilter = useDebounce(globalFilter, 500);

  const [filters, setFilters] = React.useState<Filter[]>(initialFilters);

  //row selection state
  const [rowSelection, setRowSelection] = React.useState({});

  React.useEffect(() => {
    if (pageIndex >= pageCount) {
      setPageIndex(0);
    }
  }, [pageIndex, pageCount]);

  React.useEffect(() => {
    setRowSelection({});
  }, [pageIndex]);

  React.useEffect(() => {
    const params = new URLSearchParams({
      page: (pageIndex + 1).toString(),
      per_page: pageSize.toString(),
      sort: sorting.length
        ? `${sorting[0].id}.${sorting[0].desc ? 'desc' : 'asc'}`
        : `${defaultColumn}.asc`,
      search: debouncedGlobalFilter,
    });

    filters.forEach(({ key, selectedValues }) => {
      if (selectedValues.length > 0) {
        params.set(key, selectedValues.join(','));
      }
    });

    setSearchParams(params);
  }, [
    pageIndex,
    pageSize,
    sorting,
    debouncedColumnFilters,
    debouncedGlobalFilter,
    filters,
    defaultColumn,
    setSearchParams,
  ]);

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      sorting,
      columnFilters,
      globalFilter: debouncedGlobalFilter,
      pagination: { pageIndex, pageSize },
      rowSelection,
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
  });

  const updateFilter = (key: string, values: string[]) => {
    setFilters((prev) =>
      prev.map((filter) =>
        filter.key === key ? { ...filter, selectedValues: values } : filter
      )
    );
    setPageIndex(0);
  };

  return {
    table,
    setSorting,
    setColumnFilters,
    setPageIndex,
    setPageSize,
    globalFilter,
    setGlobalFilter,
    filters,
    setFilters,
    updateFilter,
    rowSelection, //row selection
    setRowSelection, //set row selection
  };
}
