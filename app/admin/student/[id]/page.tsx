// app/admin/student/[id]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import React, { Suspense } from "react";

// Content and feature imports
import { ContentLayout } from "@/components/layout/content-layout";
import StudentDetails from "@/components/features/students/view/StudentDetails";
import GeneralInfo from "@/components/features/students/view/GeneralInfo";
import ImportantInfo from "@/components/features/students/view/ImportantInfo";
import StudentSettings from "@/components/features/students/view/StudentSettings";
import StudentTable from "@/components/features/students/view/StudentTable";

// Skeleton imports
import StudentDetailsSkeleton from "@/components/features/students/view/skeletons/StudentDetailsSkeleton";
import GeneralInfoSkeleton from "@/components/features/students/view/skeletons/GeneralInfoSkeleton";
import ImportantInfoSkeleton from "@/components/features/students/view/skeletons/ImportantInfoSkeleton";
import StudentSettingsSkeleton from "@/components/features/students/view/skeletons/StudentSettingsSkeleton";
import StudentTableSkeleton from "@/components/features/students/view/skeletons/StudentTableSkeleton";

// Advanced type definition to match Next.js expectations
type StudentPageProps = {
  params: {
    id: string;
  } & Promise<{
    then: () => void;
    catch: () => void;
    finally: () => void;
    [Symbol.toStringTag]: string;
  }>;
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
};

// Metadata generation
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  return {
    title: `Student Details - ${params.id}`,
    description: `Detailed information for student with ID ${params.id}`,
  };
}

// Main page component
export default function StudentPage({ params }: { params: { id: string } }) {
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
