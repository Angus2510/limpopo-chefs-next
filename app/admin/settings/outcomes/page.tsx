import { ContentLayout } from "@/components/layout/content-layout";

import { searchParamsSchema, GetOutcomeSchema } from "@/types/outcome/outcome";
import { OutcomeTable } from "@/components/tables/basic/outcome/OutcomeTable";
import { DataTableSkeleton } from "@/components/tables/basic/data-table-skeleton";
import { getOutcomeData } from "@/lib/actions/outcome/outcomeQuery";
import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";

interface IndexPageProps {
  searchParams: Promise<Partial<GetOutcomeSchema>>;
}
export default async function Outcome({ searchParams }: IndexPageProps) {
  const search: GetOutcomeSchema = searchParamsSchema.parse(searchParams);

  const { outcome, pageCount } = await getOutcomeData(search);

  const hidden = [
    {
      id: "01",
      title: "Yes",
    },
    {
      id: "02",
      title: "No",
    },
  ];
  const types = [
    {
      id: "01",
      title: "Theory",
    },
    {
      id: "02",
      title: "Practical",
    },
    {
      id: "02",
      title: "Exams_Well",
    },
  ];

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
            <OutcomeTable
              outcome={outcome}
              pageCount={pageCount}
              type={types}
              hidden={hidden}
              initialSearch={search}
            />
          </React.Suspense>
        </CardContent>
      </Card>
    </ContentLayout>
  );
}
