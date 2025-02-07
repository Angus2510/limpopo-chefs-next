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

interface StudentsTableProps {
  students: any[];
  pageCount: number;
  campuses: { id: string; title: string }[];
  intakeGroups: { id: string; title: string }[];
  initialSearch: any;
}

// Let TypeScript infer the router type
const columns = (
  router: ReturnType<typeof useRouter>
): ColumnDef<any, any>[] => [
  {
    accessorKey: "admissionNumber",
    header: "Student No",
    enableSorting: true,
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
        router.push(`/admin/student/${student.id}`);
      };
      const editStudent = () => {
        router.push(`/admin/student/edit/${student.id}`);
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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(student.id)}
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
      />
    </SearchParamsProvider>
  );
}
