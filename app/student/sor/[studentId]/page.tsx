import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ResultsTab } from "@/components/students/StudentView/tabs/ResultsTab";
import { fetchStudentData } from "@/lib/actions/student/fetchStudentData";
import { ContentLayout } from "@/components/layout/content-layout";
import { DownloadSORButton } from "@/components/students/DownloadSORButton";
import { filterAndSortResults, getIntakeCategory } from "@/utils/resultsSetup";

const SORPage = async ({ params }: { params: { studentId: string } }) => {
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
    const studentNumber = data.student.admissionNumber || studentId;

    // CRITICAL FIX: Match exactly how StudentView.tsx extracts intakeGroup
    // Use ONLY intakeGroupTitle which is what StudentView uses
    const intakeGroup = data.student.intakeGroupTitle || "";

    // Get the standardized intake category for display and filtering
    const intakeCategory = getIntakeCategory(intakeGroup);

    // Debug logging
    console.log(`Student ${studentId} intake mapping:`, {
      intakeGroup, // This is the raw value we'll pass to ResultsTab
      mappedCategory: intakeCategory,
      studentData: {
        intakeGroupTitle: data.student.intakeGroupTitle,
        intakeGroup: data.student.intakeGroup,
        qualification: data.student.qualificationTitle,
      },
    });

    // Filter and sort results based on the intakeGroup
    const totalResults = data.results?.length || 0;
    const filteredResults =
      data.results && data.results.length > 0
        ? filterAndSortResults(data.results, intakeGroup)
        : [];

    console.log(
      `Results filtered: ${totalResults} → ${filteredResults.length} for category ${intakeCategory}`
    );

    return (
      <ContentLayout title="Statement of Results">
        <div className="w-full p-4">
          <div className="mb-6 max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-start">
            <div>
              <h2 className="text-2xl font-bold">
                {firstName} {lastName}
              </h2>
              <p className="text-muted-foreground">
                Admission Number: {studentNumber}
              </p>
              <p className="text-muted-foreground">
                Program: {data.student.qualificationTitle || "Not Specified"}
              </p>
              <p className="text-muted-foreground">
                Intake Group: {intakeGroup}
              </p>
              <p className="text-muted-foreground font-medium">
                Category: {intakeCategory}
              </p>
            </div>

            <div className="mt-4 md:mt-0">
              <DownloadSORButton
                studentData={{ ...data, results: filteredResults }}
              />
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredResults.length} results for {intakeCategory}{" "}
              category
              {filteredResults.length === 0 &&
                totalResults > 0 &&
                ` (${totalResults} total results were filtered)`}
            </p>
          </div>

          <Suspense fallback={<div>Loading results...</div>}>
            <div className="w-full overflow-x-auto">
              {filteredResults.length > 0 ? (
                <ResultsTab
                  results={filteredResults}
                  intakeGroup={intakeGroup} // CRITICAL FIX: Pass the RAW intakeGroup, not the category!
                />
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">
                    No results available for this student&apos;s program
                    category: {intakeCategory}
                  </p>
                  {totalResults > 0 && (
                    <p className="mt-2 text-sm text-gray-500">
                      Note: {totalResults} results exist but don&apos;t match
                      the {intakeCategory} curriculum. This may indicate the
                      student&apos;s intake group needs to be updated.
                    </p>
                  )}
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
          <pre className="mt-2 text-left text-sm bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        )}
      </div>
    );
  }
};

export default SORPage;
