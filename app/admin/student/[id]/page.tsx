// app/admin/student/[id]/page.tsx
import React, { Suspense } from "react";
import { ContentLayout } from "@/components/layout/content-layout";
import StudentDetails from "@/components/features/students/view/StudentDetails";
import GeneralInfo from "@/components/features/students/view/GeneralInfo";
import ImportantInfo from "@/components/features/students/view/ImportantInfo";
import StudentSettings from "@/components/features/students/view/StudentSettings";
import StudentTable from "@/components/features/students/view/StudentTable";

// Skeleton components for loading states
import StudentDetailsSkeleton from "@/components/features/students/view/skeletons/StudentDetailsSkeleton";
import GeneralInfoSkeleton from "@/components/features/students/view/skeletons/GeneralInfoSkeleton";
import ImportantInfoSkeleton from "@/components/features/students/view/skeletons/ImportantInfoSkeleton";
import StudentSettingsSkeleton from "@/components/features/students/view/skeletons/StudentSettingsSkeleton";
import StudentTableSkeleton from "@/components/features/students/view/skeletons/StudentTableSkeleton";

// Define the page props type with Next.js expected structure
type StudentPageProps = {
  params: {
    id: string;
  };
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
};

// Main page component using function declaration for better TS compatibility
export default function StudentPage({ params }: StudentPageProps) {
  // Destructure the student ID from params
  const { id } = params;

  return (
    <ContentLayout title="Student Details">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Suspense for code splitting and loading states */}
        <Suspense fallback={<StudentDetailsSkeleton />}>
          <StudentDetails studentId={id} />
        </Suspense>

        <Suspense fallback={<GeneralInfoSkeleton />}>
          <GeneralInfo studentId={id} />
        </Suspense>

        <Suspense fallback={<ImportantInfoSkeleton />}>
          <ImportantInfo studentId={id} />
        </Suspense>

        <Suspense fallback={<StudentSettingsSkeleton />}>
          <StudentSettings studentId={id} />
        </Suspense>
      </div>

      <div className="mt-8">
        <Suspense fallback={<StudentTableSkeleton />}>
          <StudentTable studentId={id} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
