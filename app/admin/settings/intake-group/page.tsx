import React from "react";
import AddIntakeGroup from "@/components/forms/intakeGroups/IntakeGroupManager";
import { ContentLayout } from "@/components/layout/content-layout";
import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";

const page = async () => {
  const intakeGroups = await getAllIntakeGroups(); // Fetch intake groups

  return (
    <ContentLayout title="Add Intake Group">
      <AddIntakeGroup />
      {/* Pass intakeGroups to your form */}
    </ContentLayout>
  );
};

export default page;
