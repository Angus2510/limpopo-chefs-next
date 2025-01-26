'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { SearchParamsProvider } from '../SearchParamsProvider';
import { DataTable } from '../DataTable';
import { payableSearchParamsSchema } from './searchParams';
import { Button } from '@/components/ui/button';
import { Filter } from '@/types/tables/basic/filterTypes';
import { PayableSheet } from '@/components/sheet/finance/PayableSheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus } from 'lucide-react';

interface PayableTableProps {
  students: any[];
  pageCount: number;
  campuses: { id: string; title: string }[];
  intakeGroups: { id: string; title: string }[];
  initialSearch: any;
}

export function PayableTable({
  students,
  pageCount,
  campuses,
  intakeGroups,
  initialSearch,
}: PayableTableProps) {
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<any>(null);

  const handleOpenSheet = (student: any) => {
    setSelectedStudent(student);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
  };

  const handleSave = (data: any) => {
    console.log('Payable data:', data);
    // Implement save logic here
    handleCloseSheet(); // Close sheet after saving
  };

  const initialSearchParams = {
    page: initialSearch.page ?? 1,
    per_page: initialSearch.per_page ?? 10,
    sort: initialSearch.sort ?? '',
    search: initialSearch.search ?? '',
  };

  const initialFilters: Filter[] = [
    {
      title: 'Campuses',
      options: campuses.map(campus => ({ id: campus.id, title: campus.title })),
      selectedValues: initialSearch.campusTitles ?? [],
      key: 'campusTitles',
    },
    {
      title: 'Intake Groups',
      options: intakeGroups.map(group => ({ id: group.id, title: group.title })),
      selectedValues: initialSearch.intakeGroupTitles ?? [],
      key: 'intakeGroupTitles',
    },
  ];

  const columns: ColumnDef<any, any>[] = [
    {
      accessorKey: 'admissionNumber',
      header: 'Student No',
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
      accessorKey: 'admissionDate',
      header: 'Admission Date',
      enableSorting: false,
    },
    {
      accessorKey: 'campuses',
      header: 'Campus',
      enableSorting: false,
    },
    {
      accessorKey: 'intakeGroups',
      header: 'Intake Group',
      enableSorting: false,
    },
    {
      accessorKey: 'profileBlocked',
      header: 'Profile Blocked',
      enableSorting: false,
    },
    {
      accessorKey: 'payableAmounts',
      header: 'Payable Amounts',
      enableSorting: false,
    },
    {
      accessorKey: 'payableDueDates',
      header: 'Payable Due Dates',
      enableSorting: false,
    },
    {
      id: 'add',
      header: 'Add',
      cell: ({ row }) => {
        const student = row.original;
        return (
          <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => handleOpenSheet(student)}>
            <Plus className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  return (
    <SearchParamsProvider
      searchSchema={payableSearchParamsSchema}
      initialState={initialSearchParams}
    >
      <DataTable
        columns={columns}
        data={students}
        pageCount={pageCount}
        filters={initialFilters}
      />
      {selectedStudent && (
        <PayableSheet
          studentId={selectedStudent.id}
          firstName={selectedStudent.firstName}
          lastName={selectedStudent.lastName}
          studentNumber={selectedStudent.admissionNumber}
          onSave={handleSave}
          onClose={handleCloseSheet}
          isOpen={isSheetOpen}
        />
      )}
    </SearchParamsProvider>
  );
}
