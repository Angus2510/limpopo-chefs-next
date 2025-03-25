import { Suspense } from "react";
import { getAssignmentById } from "@/lib/actions/assignments/getAssignmentById";
import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";
import { getAllOutcomes } from "@/lib/actions/intakegroup/outcome/outcomeQuery";
import { ContentLayout } from "@/components/layout/content-layout";
import EditAssignmentForm from "@/components/assignments/EditAssignmentForm";
import { notFound } from "next/navigation";

interface PageProps {
  params: { id: string };
}

export default async function EditAssignmentPage(props: PageProps) {
  console.log("🚀 Starting EditAssignmentPage with props:", props);

  // Ensure params are available
  const params = await Promise.resolve(props.params);
  const id = params?.id;
  console.log("📝 Assignment ID:", id);

  // Early return if no ID
  if (!id) {
    console.log("❌ No ID provided, redirecting to 404");
    notFound();
  }

  try {
    // First fetch the assignment to verify it exists
    console.log("🔍 Fetching assignment with ID:", id);
    const assignment = await getAssignmentById(id);

    if (!assignment) {
      console.log("❌ Assignment not found, redirecting to 404");
      notFound();
    }

    console.log("✅ Assignment found:", {
      id: assignment.id,
      title: assignment.title,
      type: assignment.type,
    });

    // Then fetch other data
    console.log("🔄 Fetching additional data (intake groups and outcomes)");
    const [intakeGroups, outcomes] = await Promise.all([
      getAllIntakeGroups(),
      getAllOutcomes(),
    ]);

    console.log("📊 Data fetched successfully:", {
      intakeGroupsCount: intakeGroups.length,
      outcomesCount: outcomes.length,
    });

    return (
      <ContentLayout title={`Edit ${assignment.title}`}>
        <div className="container mx-auto py-6">
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900">
              Total Marks: {assignment.totalMarks}
            </h2>
          </div>
          <Suspense
            fallback={
              <div>
                {console.log("⌛ Loading EditAssignmentForm component...")}
                Loading...
              </div>
            }
          >
            {console.log("🎯 Rendering EditAssignmentForm with data")}
            <EditAssignmentForm
              assignment={assignment}
              intakeGroups={intakeGroups}
              outcomes={outcomes}
            />
          </Suspense>
        </div>
      </ContentLayout>
    );
  } catch (error) {
    console.error("🔥 Error in EditAssignmentPage:", {
      error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    notFound();
  }
}
