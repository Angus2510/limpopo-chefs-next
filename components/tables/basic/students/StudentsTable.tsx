"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { SearchParamsProvider } from "../SearchParamsProvider";
import { DataTable } from "../DataTable";
import { studentSearchParamsSchema } from "./searchParams";
import { Button } from "@/components/ui/button";
import { Filter } from "@/types/tables/basic/filterTypes";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  idNumber: string;
  campuses: string;
  intakeGroups: string;
  inactiveReason?: string;
}

// Let TypeScript infer the router type
const columns = (
  router: ReturnType<typeof useRouter>
): ColumnDef<Student, any>[] => [
  {
    accessorKey: "admissionNumber",
    header: "Student No",
    cell: ({ row }) => {
      const student = row.original;
      return (
        <div
          onClick={(e) => {
            e.stopPropagation(); // Prevent double navigation
            router.push(`/admin/student/studentView/${student.id}`);
          }}
          className="cursor-pointer hover:underline"
        >
          {student.admissionNumber}
        </div>
      );
    },
  },
  {
    accessorKey: "firstName",
    header: "First Name",
    enableSorting: true,
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
    enableSorting: true,
  },
  {
    accessorKey: "email",
    header: "Email",
    enableSorting: true,
  },
  {
    accessorKey: "idNumber",
    header: "ID No",
    enableSorting: false,
  },
  {
    accessorKey: "campuses",
    header: "Campus",
    enableSorting: false,
  },
  {
    accessorKey: "intakeGroups",
    header: "Intake Group",
    enableSorting: false,
  },
  {
    accessorKey: "inactiveReason",
    header: "Disable Reason",
    enableSorting: false,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const student = row.original;
      const viewStudent = () => {
        router.push(`/admin/student/studentView/${student.id}`);
      };
      const editStudent = (e: React.MouseEvent) => {
        e.stopPropagation(); // Stop the row click event from firing
        router.push(`/admin/student/edit/${student.id}`);
      };
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()} // Stop row click when opening dropdown
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            {" "}
            {/* Stop row click in dropdown */}
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(student.id);
              }}
            >
              Copy Student No
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={viewStudent}>
              View Student
            </DropdownMenuItem>
            <DropdownMenuItem onClick={editStudent}>
              Edit Student
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function StudentsTable({
  students,
  pageCount,
  campuses,
  intakeGroups,
  initialSearch,
}: StudentsTableProps) {
  const router = useRouter();
  const initialSearchParams = {
    page: initialSearch.page ?? 1,
    per_page: initialSearch.per_page ?? 10,
    sort: initialSearch.sort ?? "",
    search: initialSearch.search ?? "",
  };

  const initialFilters: Filter[] = [
    {
      title: "Campuses",
      options: campuses.map((campus) => ({
        id: campus.id,
        title: campus.title,
      })),
      selectedValues: initialSearch.campusTitles ?? [],
      key: "campusTitles",
    },
    {
      title: "Intake Groups",
      options: intakeGroups.map((group) => ({
        id: group.id,
        title: group.title,
      })),
      selectedValues: initialSearch.intakeGroupTitles ?? [],
      key: "intakeGroupTitles",
    },
  ];

  return (
    <SearchParamsProvider
      searchSchema={studentSearchParamsSchema}
      initialState={initialSearchParams}
    >
      <DataTable
        columns={columns(router)}
        data={students}
        pageCount={pageCount}
        filters={initialFilters}
        onRowClick={(row) => {
          router.push(`/admin/student/studentView/${row.original.id}`);
        }}
        rowClassName="cursor-pointer hover:bg-gray-50"
      />
    </SearchParamsProvider>
  );
}
