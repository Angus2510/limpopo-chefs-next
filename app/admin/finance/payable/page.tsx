import { ContentLayout } from "@/components/layout/content-layout";

import { searchParamsSchema, GetPayableSchema } from "@/types/payable/payable";
import { PayableTable } from "@/components/tables/basic/payable/PayableTable";
import { DataTableSkeleton } from "@/components/tables/basic/data-table-skeleton";
import { getPayableData } from "@/lib/actions/finance/payableQuery";
import { getAllCampuses } from "@/lib/actions/campus/campuses";
import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";
import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";

interface IndexPageProps {
  searchParams: Partial<GetPayableSchema>;
}

export default async function Payable({ searchParams }: IndexPageProps) {
  const search: GetPayableSchema = searchParamsSchema.parse(searchParams);

  // Fetch data for students
  const { students, pageCount } = await getPayableData(search);
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
            <PayableTable
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
