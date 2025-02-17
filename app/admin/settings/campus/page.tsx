import { Suspense } from "react";
import { ContentLayout } from "@/components/layout/content-layout";
import CampusTable from "@/components/tables/basic/campus/CampusTable";

export default function CampusPage() {
  return (
    <ContentLayout title="Campus Management">
      <Suspense fallback={<div>Loading...</div>}>
        <CampusTable />
      </Suspense>
    </ContentLayout>
  );
}
