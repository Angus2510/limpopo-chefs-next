import { ContentLayout } from "@/components/layout/content-layout";
import { Calendar } from "@/components/calendar/Calendar";
import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";
import { getAllOutcomes } from "@/lib/actions/intakegroup/outcome/outcomeQuery";

export default async function DashboardPage() {
  const intakeGroups = await getAllIntakeGroups();
  const outcomes = await getAllOutcomes();

  return (
    <ContentLayout title="Dashboard">
      <div className="h-full p-4 space-y-4">
        <Calendar intakeGroups={intakeGroups || []} />
      </div>
    </ContentLayout>
  );
}
