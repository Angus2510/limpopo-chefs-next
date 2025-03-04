import { Suspense } from "react";
import { notFound } from "next/navigation";
import StudentView from "@/components/students/StudentView";
import { fetchStudentData } from "@/lib/actions/student/fetchStudentData";
import { ContentLayout } from "@/components/layout/content-layout";

const StudentPage = async ({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) => {
  const resolvedParams = await params;

  if (!resolvedParams || !resolvedParams.id) {
    console.error("Error: Missing student ID.");
    return notFound();
  }

  const id = resolvedParams.id;
  console.log("Fetching student data for ID:", id);

  try {
    // Fetch all student data using the centralized function
    const studentData = await fetchStudentData(id);

    if (!studentData) {
      console.error("Error: No data found for student ID:", id);
      return <div>No student data found.</div>;
    }

    return (
      <ContentLayout title="Student View">
        <Suspense fallback={<div>Loading...</div>}>
          <StudentView data={studentData} />
        </Suspense>
      </ContentLayout>
    );
  } catch (error) {
    console.error("Error in StudentPage:", error);
    return <div>Error loading student data</div>;
  }
};

export default StudentPage;
