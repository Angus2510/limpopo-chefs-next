import { ContentLayout } from "@/components/layout/content-layout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import prisma from "@/lib/db";
import { getAllCampuses, type Campus } from "@/lib/actions/campus/campuses";

// Utility functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: Date) => {
  try {
    return format(dateString, "dd MMM yyyy");
  } catch (error) {
    return "N/A";
  }
};

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

      // Get the latest fee information
      const latestFee = finance.collectedFees[0];

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
        totalDebit,
        latestDueDate: latestFee?.transactionDate || null,
        description: latestFee?.description || "No description",
      };
    })
    .filter((student) => student.totalDebit > 0)
    .sort((a, b) => b.totalDebit - a.totalDebit);

  const totalArrears = studentsWithArrears.reduce(
    (sum, student) => sum + student.totalDebit,
    0
  );

  return {
    students: studentsWithArrears,
    totalArrears,
    studentsInArrears: studentsWithArrears.length,
  };
}

export default async function ArrearsReportPage() {
  const { students, totalArrears, studentsInArrears } =
    await getStudentsInArrears();

  return (
    <ContentLayout title="Students in Arrears Report">
      <Card className="rounded-lg border-none">
        <CardContent className="p-6">
          {/* Summary Statistics */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold">Total Outstanding</h3>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalArrears)}
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="text-lg font-semibold">Students in Arrears</h3>
              <p className="text-2xl font-bold">{studentsInArrears}</p>
            </Card>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Campus</TableHead>
                <TableHead>Outstanding Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id} className="text-red-600">
                  <TableCell>{student.admissionNumber}</TableCell>
                  <TableCell>
                    {student.firstName} {student.lastName}
                  </TableCell>
                  <TableCell>{student.campus}</TableCell>
                  <TableCell>{formatCurrency(student.totalDebit)}</TableCell>
                  <TableCell>
                    {student.latestDueDate
                      ? formatDate(student.latestDueDate)
                      : "N/A"}
                  </TableCell>
                  <TableCell>{student.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </ContentLayout>
  );
}
