import React, { Suspense } from "react";
import { ContentLayout } from "@/components/layout/content-layout";
import StudentDetails from "@/components/features/students/view/StudentDetails";
import GeneralInfo from "@/components/features/students/view/GeneralInfo";
import ImportantInfo from "@/components/features/students/view/ImportantInfo";
import StudentSettings from "@/components/features/students/view/StudentSettings";
import StudentTable from "@/components/features/students/view/StudentTable";

import StudentDetailsSkeleton from "@/components/features/students/view/skeletons/StudentDetailsSkeleton";
import GeneralInfoSkeleton from "@/components/features/students/view/skeletons/GeneralInfoSkeleton";
import ImportantInfoSkeleton from "@/components/features/students/view/skeletons/ImportantInfoSkeleton";
import StudentSettingsSkeleton from "@/components/features/students/view/skeletons/StudentSettingsSkeleton";
import StudentTableSkeleton from "@/components/features/students/view/skeletons/StudentTableSkeleton";

interface StudentPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Make sure to wrap your code in async functions if you're fetching data asynchronously
const StudentPage: React.FC<StudentPageProps> = async ({ params }) => {
  // Handle the async logic for fetching data here if needed
  return (
    <ContentLayout title="Student">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Suspense fallback={<StudentDetailsSkeleton />}>
          <StudentDetails studentId={params.id} />
        </Suspense>
        <Suspense fallback={<GeneralInfoSkeleton />}>
          <GeneralInfo studentId={params.id} />
        </Suspense>
        <Suspense fallback={<ImportantInfoSkeleton />}>
          <ImportantInfo studentId={params.id} />
        </Suspense>
        <Suspense fallback={<StudentSettingsSkeleton />}>
          <StudentSettings studentId={params.id} />
        </Suspense>
      </div>
      <div className="mt-8">
        <Suspense fallback={<StudentTableSkeleton />}>
          <StudentTable studentId={params.id} />
        </Suspense>
      </div>
    </ContentLayout>
  );
};

export default StudentPage;
