import AddStudentForm from "@/components/forms/student/addStudent";
import { ContentLayout } from "@/components/layout/content-layout";
import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";
import { getAllCampuses } from "@/lib/actions/campus/campuses";
import { getAllQualifications } from "@/lib/actions/qualification/action";
import { getAllAccommodations } from "@/lib/actions/accommodation/action";

export default async function AddStudentPage() {
  const intakeGroups = await getAllIntakeGroups();
  const campuses = await getAllCampuses();
  const qualifications = await getAllQualifications();
  const accommodations = await getAllAccommodations();

  return (
    <ContentLayout title="Add Students">
      <AddStudentForm
        intakeGroups={intakeGroups}
        campuses={campuses}
        qualifications={qualifications}
        accommodations={accommodations}
      />
    </ContentLayout>
  );
}
