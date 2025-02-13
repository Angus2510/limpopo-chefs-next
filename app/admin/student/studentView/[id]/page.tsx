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
  // Await params since it may be a Promise.
  const resolvedParams = await params;

  // Ensure the parameters exist and contain an ID.
  if (!resolvedParams || !resolvedParams.id) {
    console.error("Error: Missing student ID.");
    return notFound();
  }

  const id = resolvedParams.id;
  console.log("Fetching student data for ID:", id);

  try {
    const data = await fetchStudentData(id);

    if (!data) {
      console.error("Error: No data found for student ID:", id);
      return <div>No student data found.</div>;
    }

    return (
      <ContentLayout title={"student View"}>
        <Suspense fallback={<div>Loading...</div>}>
          <StudentView data={data} />
        </Suspense>
      </ContentLayout>
    );
  } catch (error) {
    console.error("Error in StudentPage:", error);
    return <div>Error loading student data</div>;
  }
};

export default StudentPage;
