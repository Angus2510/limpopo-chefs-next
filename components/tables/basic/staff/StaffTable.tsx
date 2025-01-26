'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { SearchParamsProvider } from '../SearchParamsProvider';
import { DataTable } from '../DataTable';
import { staffSearchParamsSchema } from './staffSearchParams';
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

interface StaffTableProps {
  staff: any[];
  pageCount: number;
  initialSearch: any;
}

// Let TypeScript infer the router type
const columns = (router: ReturnType<typeof useRouter>): ColumnDef<any, any>[] => [
  {
    accessorKey: 'username',
    header: 'Username',
    enableSorting: true,
  },
  {
    accessorKey: 'firstName',
    header: 'First Name',
    enableSorting: true,
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
    enableSorting: true,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    enableSorting: true,
  },
  {
    accessorKey: 'idNumber',
    header: 'ID No',
    enableSorting: false,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const staff = row.original;
      const viewStaff = () => {
        router.push(`/admin/staff/${staff.id}`);
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(staff.id)}>
              Copy Staff ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={viewStaff}>View Staff</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(staff.id)}>Edit Staff</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function StaffTable({ staff, pageCount, initialSearch }: StaffTableProps) {
  const router = useRouter();
  const initialSearchParams = {
    page: initialSearch.page ?? 1,
    per_page: initialSearch.per_page ?? 10,
    sort: initialSearch.sort ?? '',
    search: initialSearch.search ?? '',
  };

  return (
    <SearchParamsProvider searchSchema={staffSearchParamsSchema} initialState={initialSearchParams}>
      <DataTable columns={columns(router)} data={staff} pageCount={pageCount} filters={[]} />
    </SearchParamsProvider>
  );
}
