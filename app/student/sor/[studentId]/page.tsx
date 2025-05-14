import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ResultsTab } from "@/components/students/StudentView/tabs/ResultsTab";
import { fetchStudentData } from "@/lib/actions/student/fetchStudentData";
import { ContentLayout } from "@/components/layout/content-layout";
import { DownloadSORButton } from "@/components/students/DownloadSORButton";
import { filterAndSortResults, getIntakeCategory } from "@/utils/resultsSetup";

const SORPage = async ({ params }: { params: { studentId: string } }) => {
  // Next.js expects params to be awaited in newer versions
  const studentId = params.studentId;

  if (!studentId) {
    console.error("Error: Missing student ID.");
    return notFound();
  }

  try {
    const data = await fetchStudentData(studentId);

    if (!data || !data.student) {
      console.error("Error: No data found for student ID:", studentId);
      return <div>No student data found.</div>;
    }

    const firstName = data.student.profile?.firstName || "Unknown";
    const lastName = data.student.profile?.lastName || "";
    const studentNumber = data.student.studentNumber || studentId;

    // Get the intake string from student data - ensure it's a string value
    const rawIntakeValue =
      data.student.intakeGroup || data.student.qualificationTitle || "OCG";
    // Convert to string to ensure we can call string methods on it
    const intakeString = String(rawIntakeValue);

    // Get the standardized intake category
    const intakeCategory = getIntakeCategory(intakeString);

    // Filter and sort results based on the student's intake group
    const filteredResults =
      data.results && data.results.length > 0
        ? filterAndSortResults(data.results, intakeString)
        : [];

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
              <p className="text-muted-foreground">
                Intake Group: {intakeString}
              </p>
              <p className="text-muted-foreground font-medium">
                Category: {intakeCategory}
              </p>
            </div>

            <DownloadSORButton
              studentData={{ ...data, results: filteredResults }}
            />
          </div>

          <Suspense fallback={<div>Loading results...</div>}>
            <div className="w-full overflow-x-auto">
              {filteredResults.length > 0 ? (
                <ResultsTab results={filteredResults} />
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">
                    No results available for this student&apos;s program
                    category: {intakeCategory}
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
