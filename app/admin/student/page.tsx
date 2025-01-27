import { ContentLayout } from "@/components/layout/content-layout";

import {
  searchParamsSchema,
  GetStudentsSchema,
} from "@/types/student/students";
import { StudentsTable } from "@/components/tables/basic/students/StudentsTable";
import { DataTableSkeleton } from "@/components/tables/basic/data-table-skeleton";
import { getStudentsData } from "@/lib/actions/student/studentsQuery";
import { getAllCampuses } from "@/lib/actions/campus/campuses";
import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";
import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";

interface IndexPageProps {
  searchParams: Partial<GetStudentsSchema>;
}

export default async function Students({ searchParams }: IndexPageProps) {
  // Debug: Log the exact type and structure of searchParams

  const resolvedSearchParams = await searchParams;

  const search: GetStudentsSchema =
    searchParamsSchema.parse(resolvedSearchParams);

  // Fetch data for students
  const { students, pageCount } = await getStudentsData(search);
  const campuses = await getAllCampuses();
  const intakeGroups = await getAllIntakeGroups();

  return (
    <ContentLayout title="Students">
      <Card className="rounded-lg border-none">
        <CardContent className="p-6">
          <React.Suspense
            fallback={
              <DataTableSkeleton
                columnCount={5}
                searchableColumnCount={1}
                filterableColumnCount={2}
                cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem"]}
                shrinkZero
              />
            }
          >
            <StudentsTable
              students={students}
              pageCount={pageCount}
              campuses={campuses}
              intakeGroups={intakeGroups}
              initialSearch={search}
            />
          </React.Suspense>
        </CardContent>
      </Card>
    </ContentLayout>
  );
}
