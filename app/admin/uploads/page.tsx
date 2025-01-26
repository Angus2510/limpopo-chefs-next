import { ContentLayout } from "@/components/layout/content-layout";
import { getUploadsData } from '@/lib/actions/uploads/uploadsQuery';
import { UploadsTable } from '@/components/tables/select/uploads/UploadsTable';
import { DataTableSkeleton } from '@/components/tables/select/data-table-skeleton';
import * as React from "react";

import { getAllIntakeGroups } from '@/lib/actions/intakegroup/intakeGroups';

import { uploadsSearchParamsSchema, UploadsSearchParams } from '@/types/uploads/uploads';

import { Card, CardContent } from "@/components/ui/card";

import { DialogButton } from "@/components/dialogs/uploads/DialogButton";

interface IndexPageProps {
  searchParams: Partial<UploadsSearchParams>;
}

export default async function Uploads({ searchParams }: IndexPageProps) {
  const search: UploadsSearchParams = uploadsSearchParamsSchema.parse(searchParams);
  const { uploads, pageCount } = await getUploadsData(search);
  const intakeGroups = await getAllIntakeGroups();

  return (
    <ContentLayout title="Staff">
      <Card className="rounded-lg border-none">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
           <DialogButton intakeGroups={intakeGroups} />
           </div>
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
           <UploadsTable
            uploads={uploads}
            pageCount={pageCount}
            intakeGroups={intakeGroups}
            initialSearch={search}
            />
          </React.Suspense>
        </CardContent>
      </Card>
    </ContentLayout>
  );
}
