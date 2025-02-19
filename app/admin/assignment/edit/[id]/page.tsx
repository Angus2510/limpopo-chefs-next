import { Suspense } from "react";
import { getAssignmentById } from "@/lib/actions/assignments/getAssignmentById";
import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";
import { getAllOutcomes } from "@/lib/actions/outcome/outcomeQuery";
import { ContentLayout } from "@/components/layout/content-layout";
import EditAssignmentForm from "@/components/assignments/EditAssignmentForm";
import { notFound } from "next/navigation";

interface PageProps {
  params: { id: string };
}

export default async function EditAssignmentPage(props: PageProps) {
  // Ensure params are available
  const params = await Promise.resolve(props.params);
  const id = params?.id;

  // Early return if no ID
  if (!id) {
    notFound();
  }

  try {
    // First fetch the assignment to verify it exists
    const assignment = await getAssignmentById(id);

    if (!assignment) {
      notFound();
    }

    // Then fetch other data
    const [intakeGroups, outcomes] = await Promise.all([
      getAllIntakeGroups(),
      getAllOutcomes(),
    ]);

    return (
      <ContentLayout title={`Edit ${assignment.title}`}>
        <div className="container mx-auto py-6">
          <Suspense fallback={<div>Loading...</div>}>
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
    console.error("Error loading assignment:", error);
    notFound();
  }
}
