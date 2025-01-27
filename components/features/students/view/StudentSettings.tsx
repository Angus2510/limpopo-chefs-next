import prisma from "@/lib/db";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StudentSettingsActions from "./StudentSettingsActions"; // Import the client component

interface StudentSettingsProps {
  studentId: string;
}

const StudentSettings: React.FC<StudentSettingsProps> = async ({
  studentId,
}) => {
  const student = await prisma.students.findUnique({
    where: { id: studentId },
    include: { profile: true },
  });

  if (!student) {
    return <div>Student not found</div>;
  }

  return (
    <Card className="w-full h-full p-3">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-navy-700 dark:text-white">
          Student Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <CardContent className="flex flex-col items-start justify-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Edit Student
            </p>
            <StudentSettingsActions action="editStudent" />
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardContent className="flex flex-col items-start justify-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Collect Fees
            </p>
            <StudentSettingsActions action="editFees" />
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardContent className="flex flex-col items-start justify-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Disable Student
            </p>
            <StudentSettingsActions action="disableStudent" />
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardContent className="flex flex-col items-start justify-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Email Reset Link
            </p>
            <StudentSettingsActions action="sendResetLink" />
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default StudentSettings;
