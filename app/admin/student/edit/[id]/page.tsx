import EditStudentForm from '@/components/forms/student/editStudent';
import { ContentLayout } from "@/components/layout/content-layout";
import { getAllIntakeGroups } from '@/lib/actions/intakegroup/intakeGroups';
import { getAllCampuses } from '@/lib/actions/campus/campuses';
import { getAllQualifications } from '@/lib/actions/qualification/action';
import { getAllAccommodations } from '@/lib/actions/accommodation/action';
import prisma from '@/lib/db';

interface EditStudentPageParams {
  id: string;
}

export default async function EditStudentPage({ params }: { params: EditStudentPageParams }) {
  const intakeGroups = await getAllIntakeGroups();
  const campuses = await getAllCampuses();
  const qualifications = await getAllQualifications();
  const accommodations = await getAllAccommodations();

  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: { profile: true },
  });

  if (!student) {
    return <div>Student not found</div>;
  }

  // Fetch guardians separately
  const guardians = await prisma.guardian.findMany({
    where: {
      id: {
        in: student.guardians,
      },
    },
  });

  return (
    <ContentLayout title="Edit Student">
      <EditStudentForm
        student={student}
        intakeGroups={intakeGroups}
        campuses={campuses}
        qualifications={qualifications} 
        accommodations={accommodations}
        guardians={guardians}
      />
    </ContentLayout>
  );
}
