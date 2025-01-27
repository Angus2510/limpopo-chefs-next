import prisma from "@/lib/db";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GeneralProps {
  studentId: string;
}

const General: React.FC<GeneralProps> = async ({ studentId }) => {
  const student = await prisma.students.findUnique({
    where: { id: studentId },
    include: { profile: true },
  });

  if (!student) {
    return <div>Student not found</div>;
  }

  const { gender, mobileNumber, idNumber, cityAndGuildNumber } =
    student.profile;
  const { email } = student;

  // Using an empty string for accommodation as per the instruction
  const accommodation = "";

  return (
    <Card className="w-full h-full p-3">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-navy-700 dark:text-white">
          General Information
        </CardTitle>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
          Details about the student
        </p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <CardContent className="flex flex-col items-start justify-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Accommodation
            </p>
            <p className="text-base font-medium text-navy-700 dark:text-white">
              {accommodation}
            </p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardContent className="flex flex-col justify-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Gender</p>
            <p className="text-base font-medium text-navy-700 dark:text-white break-words">
              {gender}
            </p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardContent className="flex flex-col items-start justify-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Mobile Number
            </p>
            <p className="text-base font-medium text-navy-700 dark:text-white break-words">
              {mobileNumber}
            </p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardContent className="flex flex-col justify-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
            <p className="text-base font-medium text-navy-700 dark:text-white break-words">
              {email}
            </p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardContent className="flex flex-col items-start justify-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ID/Passport Number
            </p>
            <p className="text-base font-medium text-navy-700 dark:text-white break-words">
              {idNumber}
            </p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardContent className="flex flex-col justify-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              City & Guilds Registration No.
            </p>
            <p className="text-base font-medium text-navy-700 dark:text-white break-words">
              {cityAndGuildNumber}
            </p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default General;
