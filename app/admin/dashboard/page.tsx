// Remove "use client" - make this a server component
import { ContentLayout } from "@/components/layout/content-layout";
import CalendarDemo from "@/components/features/calendar-demo";
import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";
import { getAllOutcomes } from "@/lib/actions/intakegroup/outcome/outcomeQuery";

export default async function DashboardPage() {
  // Server-side data fetching
  const intakeGroups = await getAllIntakeGroups();
  const outcomes = await getAllOutcomes();

  console.log("Server data:", {
    intakeGroups: intakeGroups?.length,
    outcomes: outcomes?.length,
  });

  return (
    <ContentLayout title="Dashboard">
      <CalendarDemo
        intakeGroups={intakeGroups || []}
        outcomes={outcomes?.filter((o) => !o.hidden) || []}
      />
    </ContentLayout>
  );
}
