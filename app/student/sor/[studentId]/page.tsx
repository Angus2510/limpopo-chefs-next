import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ResultsTab } from "@/components/students/StudentView/tabs/ResultsTab";
import { fetchStudentData } from "@/lib/actions/student/fetchStudentData";
import { ContentLayout } from "@/components/layout/content-layout";
import { DownloadSORButton } from "@/components/students/DownloadSORButton";

const SORPage = async ({ params }: { params: { studentId: string } }) => {
  if (!params.studentId) {
    console.error("Error: Missing student ID.");
    return notFound();
  }

  try {
    const data = await fetchStudentData(params.studentId);

    if (!data || !data.student) {
      console.error("Error: No data found for student ID:", params.studentId);
      return <div>No student data found.</div>;
    }

    const firstName = data.student.profile?.firstName || "Unknown";
    const lastName = data.student.profile?.lastName || "";
    const studentNumber = data.student.studentNumber || params.studentId;

    return (
      <ContentLayout title="Statement of Results">
        <div className="w-full p-4">
          <div className="mb-6 max-w-7xl mx-auto flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">
                {firstName} {lastName}
              </h2>
              <p className="text-muted-foreground">
                Student Number: {studentNumber}
              </p>
              <p className="text-muted-foreground">
                Program: {data.student.qualificationTitle || "Not Specified"}
              </p>
            </div>

            <DownloadSORButton studentData={data} />
          </div>

          <Suspense fallback={<div>Loading results...</div>}>
            <div className="w-full overflow-x-auto">
              {data.results && data.results.length > 0 ? (
                <ResultsTab results={data.results} />
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">
                    No results available for this student.
                  </p>
                </div>
              )}
            </div>
          </Suspense>
        </div>
      </ContentLayout>
    );
  } catch (error) {
    console.error("Error in SORPage:", error);
    return (
      <div className="p-4 text-center w-full">
        <h2 className="text-xl font-bold text-red-600">Error</h2>
        <p>Unable to load student results. Please try again later.</p>
        {process.env.NODE_ENV === "development" && (
          <pre className="mt-2 text-left text-sm bg-gray-100 p-4 rounded">
            {JSON.stringify(error, null, 2)}
          </pre>
        )}
      </div>
    );
  }
};

export default SORPage;
