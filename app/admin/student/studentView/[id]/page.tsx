import { Suspense } from "react";
import { notFound } from "next/navigation";
import StudentView from "@/components/students/StudentView";
import { fetchStudentData } from "@/lib/actions/student/fetchStudentData";
import { ContentLayout } from "@/components/layout/content-layout";
import prisma from "@/lib/db";

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
    // Fetch the basic student data
    const basicData = await fetchStudentData(id);

    if (!basicData) {
      console.error("Error: No data found for student ID:", id);
      return <div>No student data found.</div>;
    }

    // Enrich with additional data students need
    // These will be empty arrays if no data is found
    const [results, documents, finances] = await Promise.all([
      // Get results (if any)
      prisma.assignmentresults
        .findMany({
          where: { student: id },
          select: {
            id: true,
            assignment: true,
            dateTaken: true,
            scores: true,
            moderatedscores: true,
            percent: true,
            status: true,
          },
        })
        .catch(() => []),

      // Get documents (both general and legal)
      Promise.all([
        prisma.generaldocuments
          .findMany({
            where: { student: id },
          })
          .catch(() => []),
        prisma.legaldocuments
          .findMany({
            where: { student: id },
          })
          .catch(() => []),
      ]).then(([general, legal]) => [...general, ...legal]),

      // Get finances
      prisma.finances
        .findFirst({
          where: { student: id },
        })
        .catch(() => ({ collectedFees: [], payableFees: [] })),
    ]);

    // Get wellness records if they exist
    const welRecords = await prisma.studentwelrecords
      .findFirst({
        where: { student: id },
      })
      .catch(() => ({ welRecords: [] }));

    // Combine all data
    const completeData = {
      student: basicData.student,
      guardians: basicData.guardians,
      results: results,
      wellnessRecords: welRecords?.welRecords || [],
      finances: finances || { collectedFees: [], payableFees: [] },
      documents: documents || [],
    };

    return (
      <ContentLayout title="Student View">
        <Suspense fallback={<div>Loading...</div>}>
          <StudentView data={completeData} />
        </Suspense>
      </ContentLayout>
    );
  } catch (error) {
    console.error("Error in StudentPage:", error);
    return <div>Error loading student data</div>;
  }
};

export default StudentPage;
