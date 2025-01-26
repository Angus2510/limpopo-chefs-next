// src/pages/admin/staff/index.tsx

import { ContentLayout } from "@/components/layout/content-layout";
import { getCampusData } from '@/lib/actions/campus/campusQuery';
import { CampusTable } from '@/components/tables/basic/campus/CampusTable';
import { DataTableSkeleton } from '@/components/tables/basic/data-table-skeleton';
import * as React from "react";
import { campusSearchParamsSchema, CampusSearchParams } from '@/types/campus/campus';

import { Card, CardContent } from "@/components/ui/card";

interface IndexPageProps {
  searchParams: Partial<CampusSearchParams>;
}

export default async function Campus({ searchParams }: IndexPageProps) {
  const search: CampusSearchParams = campusSearchParamsSchema.parse(searchParams);
  const { campus, pageCount } = await getCampusData(search);

  return (
    <ContentLayout title="Staff">
      <Card className="rounded-lg border-none">
        <CardContent className="p-6">
          <React.Suspense
            fallback={
              <DataTableSkeleton
                columnCount={5}
                searchableColumnCount={1}
                filterableColumnCount={0}
                cellWidths={['10rem', '40rem', '12rem', '12rem', '8rem']}
                shrinkZero
              />
            }
          >
            <CampusTable campus={campus} pageCount={pageCount} initialSearch={search} />
          </React.Suspense>
        </CardContent>
      </Card>
    </ContentLayout>
  );
}
