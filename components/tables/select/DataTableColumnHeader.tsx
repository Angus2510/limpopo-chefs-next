import React from 'react';
import { ArrowDownIcon, ArrowUpIcon, CaretSortIcon, EyeNoneIcon } from '@radix-ui/react-icons';
import { Column } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  enableSorting?: boolean;
  isSelectAll?: boolean; // New prop to handle the select all checkbox
  isAllPageRowsSelected?: boolean; // New prop to handle the state of the select all checkbox
  onSelectAllChange?: (value: boolean) => void; // New prop for handling select all
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  enableSorting = false,
  isSelectAll = false, // Default to false
  isAllPageRowsSelected = false,
  onSelectAllChange,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (isSelectAll) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Checkbox
          checked={isAllPageRowsSelected}
          onCheckedChange={(value) => {
            if (onSelectAllChange) onSelectAllChange(!!value);
          }}
          aria-label="Select all rows"
        />
        <span>{title}</span>
      </div>
    );
  }

  if (!enableSorting && !column.getCanHide()) {
    return <div className={cn(className)}>{title}</div>;
  }

  if (enableSorting && !column.getCanHide()) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Button
          aria-label={
            column.getIsSorted() === 'desc'
              ? 'Sorted descending. Click to sort ascending.'
              : column.getIsSorted() === 'asc'
              ? 'Sorted ascending. Click to sort descending.'
              : 'Not sorted. Click to sort ascending.'
          }
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>{title}</span>
          {column.getIsSorted() === 'desc' ? (
            <ArrowDownIcon className="ml-2 size-4" aria-hidden="true" />
          ) : column.getIsSorted() === 'asc' ? (
            <ArrowUpIcon className="ml-2 size-4" aria-hidden="true" />
          ) : (
            <CaretSortIcon className="ml-2 size-4" aria-hidden="true" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={
              column.getIsSorted() === 'desc'
                ? 'Sorted descending. Click to sort ascending.'
                : column.getIsSorted() === 'asc'
                ? 'Sorted ascending. Click to sort descending.'
                : 'Not sorted. Click to sort ascending.'
            }
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {enableSorting && column.getIsSorted() === 'desc' ? (
              <ArrowDownIcon className="ml-2 size-4" aria-hidden="true" />
            ) : enableSorting && column.getIsSorted() === 'asc' ? (
              <ArrowUpIcon className="ml-2 size-4" aria-hidden="true" />
            ) : enableSorting ? (
              <CaretSortIcon className="ml-2 size-4" aria-hidden="true" />
            ) : null}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {enableSorting && (
            <>
              <DropdownMenuItem aria-label="Sort ascending" onClick={() => column.toggleSorting(false)}>
                <ArrowUpIcon className="mr-2 size-3.5 text-muted-foreground/70" aria-hidden="true" />
                Asc
              </DropdownMenuItem>
              <DropdownMenuItem aria-label="Sort descending" onClick={() => column.toggleSorting(true)}>
                <ArrowDownIcon className="mr-2 size-3.5 text-muted-foreground/70" aria-hidden="true" />
                Desc
              </DropdownMenuItem>
            </>
          )}
          {enableSorting && column.getCanHide() && <DropdownMenuSeparator />}
          {column.getCanHide() && (
            <DropdownMenuItem aria-label="Hide column" onClick={() => column.toggleVisibility(false)}>
              <EyeNoneIcon className="mr-2 size-3.5 text-muted-foreground/70" aria-hidden="true" />
              Hide
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
