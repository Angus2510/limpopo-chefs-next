'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { SearchParamsProvider } from '../SearchParamsProvider';
import { DataTable } from '../DataTable';
import { outcomeSearchParamsSchema } from './searchParams';
import { Button } from '@/components/ui/button';
import { Filter } from '@/types/tables/basic/filterTypes';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

interface OutcomeTableProps {
  outcome: any[];
  pageCount: number;
  type: { id: string; title: string }[];
  hidden: { id: string; title: string }[];
  initialSearch: any;
}

// Let TypeScript infer the router type
const columns = (router: ReturnType<typeof useRouter>): ColumnDef<any, any>[] => [
  {
    accessorKey: 'title',
    header: 'Title',
    enableSorting: true,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    enableSorting: true,
  },
  {
    accessorKey: 'hidden',
    header: 'Hidden',
    enableSorting: true,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const student = row.original;
      const viewStudent = () => {
        router.push(`/admin/student/${student.id}`);
      };
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(student.id)}>
              Copy Student No
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={viewStudent}>View Student</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(student.id)}>Edit Student</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function OutcomeTable({
  outcome,
  pageCount,
  type,
  hidden,
  initialSearch,
}: OutcomeTableProps) {
  const router = useRouter();
  const initialSearchParams = {
    page: initialSearch.page ?? 1,
    per_page: initialSearch.per_page ?? 10,
    sort: initialSearch.sort ?? '',
    search: initialSearch.search ?? '',
  };

  const initialFilters: Filter[] = [
    {
      title: 'Type',
      options: type.map(type => ({ id: type.id, title: type.title })),
      selectedValues: initialSearch.type ?? [],
      key: 'type',
    },
    {
      title: 'Hidden',
      options: hidden.map(hidden => ({ id: hidden.id, title: hidden.title })),
      selectedValues: initialSearch.hidden ?? [],
      key: 'hidden',
    },
  ];

  return (
    <SearchParamsProvider
      searchSchema={outcomeSearchParamsSchema}
      initialState={initialSearchParams}
    >
      <DataTable
        columns={columns(router)}
        data={outcome}
        pageCount={pageCount}
        filters={initialFilters}
      />
    </SearchParamsProvider>
  );
}
