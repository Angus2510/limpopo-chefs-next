// app/admin/student/[id]/page.tsx
import React, { Suspense } from "react";
import { Metadata } from "next";
import { ContentLayout } from "@/components/layout/content-layout";
import StudentDetails from "@/components/features/students/view/StudentDetails";
import GeneralInfo from "@/components/features/students/view/GeneralInfo";
import ImportantInfo from "@/components/features/students/view/ImportantInfo";
import StudentSettings from "@/components/features/students/view/StudentSettings";
import StudentTable from "@/components/features/students/view/StudentTable";

// Skeleton components
import StudentDetailsSkeleton from "@/components/features/students/view/skeletons/StudentDetailsSkeleton";
import GeneralInfoSkeleton from "@/components/features/students/view/skeletons/GeneralInfoSkeleton";
import ImportantInfoSkeleton from "@/components/features/students/view/skeletons/ImportantInfoSkeleton";
import StudentSettingsSkeleton from "@/components/features/students/view/skeletons/StudentSettingsSkeleton";
import StudentTableSkeleton from "@/components/features/students/view/skeletons/StudentTableSkeleton";

// Comprehensive type definition that matches Next.js expectations
export type PageProps<T extends Record<string, string> = {}> = {
  params: T;
  searchParams?: { [key: string]: string | string[] | undefined };
};

// Specific type for student page
type StudentPageProps = PageProps<{ id: string }>;

// Optional: Metadata generation for the page
export async function generateMetadata({
  params,
}: StudentPageProps): Promise<Metadata> {
  const { id } = params;

  return {
    title: `Student Details - ${id}`,
    description: `Detailed information for student with ID ${id}`,
  };
}

// Main page component
export default function StudentPage({ params }: StudentPageProps) {
  const { id } = params;

  return (
    <ContentLayout title="Student Details">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
