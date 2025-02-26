import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";
import TestCreationForm from "@/components/forms/assignment/TestCreationForm";
import { getAllOutcomes } from "@/lib/actions/outcome/outcomeQuery";
import { ContentLayout } from "@/components/layout/content-layout";

async function CreateAssignmentPage() {
  // Fetch intake groups and all outcomes in parallel
  const [intakeGroups, outcomes] = await Promise.all([
    getAllIntakeGroups(),
    getAllOutcomes(), // ✅ No input needed now
  ]);

  return (
    <ContentLayout title="Create Assessment">
      <TestCreationForm intakeGroups={intakeGroups} outcomes={outcomes} />
    </ContentLayout>
  );
}

export default CreateAssignmentPage;
