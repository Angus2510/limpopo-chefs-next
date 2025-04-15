import { ContentLayout } from "@/components/layout/content-layout";
import { Card, CardContent } from "@/components/ui/card";
import prisma from "@/lib/db";
import { getAllCampuses } from "@/lib/actions/campus/campuses";
import { FilteredArrearsTable } from "@/components/arrears/FilteredArrearsTable";

async function getStudentsInArrears() {
  // Get all finance records with debits
  const finances = await prisma.finances.findMany({
    select: {
      student: true,
      collectedFees: true,
    },
    where: {
      collectedFees: {
        some: {
          debit: {
            not: null,
          },
        },
      },
    },
  });

  // Get unique student IDs from finances
  const studentIds = [...new Set(finances.map((finance) => finance.student))];

  // Get all students with these IDs
  const students = await prisma.students.findMany({
    where: {
      id: {
        in: studentIds,
      },
    },
    include: {
      profile: true,
    },
  });

  // Get all campuses for mapping IDs to titles
  const campuses = await getAllCampuses();

  // Create a map of campus IDs to titles for faster lookup
  const campusMap = new Map(
    campuses.map((campus) => [campus.id, campus.title])
  );

  // Map student details with their finance information
  const studentsWithArrears = finances
    .map((finance) => {
      const student = students.find((s) => s.id === finance.student);

      // Calculate total debit from collected fees
      const totalDebit = finance.collectedFees.reduce((sum, fee) => {
        const debitAmount =
          typeof fee.debit === "number"
            ? fee.debit
            : typeof fee.debit === "string"
            ? parseFloat(fee.debit)
            : 0;
        return sum + debitAmount;
      }, 0);

      // Map campus IDs to titles
      const campusTitles = student?.campus
        ? Array.isArray(student.campus)
          ? student.campus
              .map((campusId) => campusMap.get(campusId) || campusId)
              .join(", ")
          : campusMap.get(student.campus) || student.campus
        : "N/A";

      return {
        id: student?.id || "",
        admissionNumber: student?.admissionNumber || "",
        firstName: student?.profile?.firstName,
        lastName: student?.profile?.lastName,
        campus: campusTitles,
      };
    })
    .filter((student) => student.id !== "");

  return {
    students: studentsWithArrears,
  };
}

export default async function ArrearsReportPage() {
  const { students } = await getStudentsInArrears();

  return (
    <ContentLayout title="Students in Arrears Report">
      <Card className="rounded-lg border-none">
        <CardContent className="p-6">
          <FilteredArrearsTable students={students} />
        </CardContent>
      </Card>
    </ContentLayout>
  );
}
