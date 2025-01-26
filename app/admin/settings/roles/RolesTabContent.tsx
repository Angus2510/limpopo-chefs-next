'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ColumnDef, flexRender } from '@tanstack/react-table';
import {
  SortingState,
  VisibilityState,
  ColumnFiltersState,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { DownloadIcon } from "@radix-ui/react-icons";
import { exportTableToCSV } from "@/lib/export";

interface Role {
  name: string;
  description: string;
  permissions: string[];
}

interface RolesTabContentProps {
  roles: Role[];
}

export default function RolesTabContent({ roles: initialRoles }: RolesTabContentProps) {
  const router = useRouter();
  const [roles, setRoles] = useState(initialRoles);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Role Name
        </Button>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      enableSorting: true,
    },
    {
      accessorKey: 'permissions',
      header: 'Permissions',
      cell: ({ row }) => (
        row.original.permissions.length > 3 ? (
          <>
            {row.original.permissions.slice(0, 3).map((permission, i) => (
              <Badge key={i} variant="secondary" className="mr-2 mb-2">
                {permission}
              </Badge>
            ))}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="link" size="sm" className="p-0">
                  View More
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="p-2">
                  {row.original.permissions.map((permission, i) => (
                    <Badge key={i} variant="secondary" className="mr-2 mb-2">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </>
        ) : (
          row.original.permissions.map((permission, i) => (
            <Badge key={i} variant="secondary" className="mr-2 mb-2">
              {permission}
            </Badge>
          ))
        )
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <>
          <Button variant="outline" size="sm">
            Edit
          </Button>
          <Button variant="outline" size="sm" className="ml-2">
            Delete
          </Button>
        </>
      ),
    },
  ];

  const filteredData = roles; // Modify this if you have specific filtering logic

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <Card className="rounded-lg border-none">  
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Roles</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/settings/roles/roles-add')}>
              <Plus className="mr-2 h-4 w-4" /> Add Role
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-between mb-4'>
            <Input
              placeholder='Search by role name...'
              value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
              onChange={event =>
                table.getColumn('name')?.setFilterValue(event.target.value)
              }
              className='max-w-sm'
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' className='ml-auto'>
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {table
                  .getAllColumns()
                  .filter(column => column.getCanHide())
                  .map(column => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className='capitalize'
                      checked={column.getIsVisible()}
                      onCheckedChange={value => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className='h-24 text-center'>
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className='flex items-center justify-end space-x-2 py-4'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
