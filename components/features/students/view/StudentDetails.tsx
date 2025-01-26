import prisma from "@/lib/db";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StudentDetailsProps {
  studentId: string;
}

const getInitials = (name: string) => {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("");
  return initials.toUpperCase();
};

const StudentDetails: React.FC<StudentDetailsProps> = async ({ studentId }) => {
  const student = await prisma.students.findUnique({
    where: { id: studentId },
    include: { profile: true },
  });

  if (!student) {
    return <div>Student not found</div>;
  }

  const initials = getInitials(
    student.profile.firstName + " " + student.profile.lastName
  );

  return (
    <Card className="items-center w-full h-full p-4">
      <CardHeader className="relative flex h-32 w-full justify-center rounded-t-xl bg-cover bg-[url('/images/profile/banner.png')] rounded-b-xl">
        <div className="absolute -bottom-12 transform -translate-x-1/2 left-1/2 flex h-24 w-24 items-center justify-center rounded-full border-4 border-gray-100 dark:border-gray-700 bg-gray-100 dark:bg-gray-700">
          <Avatar className="w-full h-full rounded-full">
            <AvatarImage
              src={student.profile.avatar || ""}
              alt={student.profile.firstName + " " + student.profile.lastName}
            />
            <AvatarFallback>
              <span className="text-xl font-medium text-gray-700 dark:text-gray-400">
                {initials}
              </span>
            </AvatarFallback>
          </Avatar>
        </div>
      </CardHeader>

      <CardContent className="mt-16 flex flex-col items-center">
        <CardTitle className="text-xl font-bold text-navy-700 dark:text-white">
          {student.profile.firstName} {student.profile.lastName}
        </CardTitle>
        <p className="text-base font-normal text-gray-600 dark:text-gray-400">
          {student.intakeGroup}
        </p>
      </CardContent>

      <CardContent className="mt-6 mb-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
        <div className="flex flex-col items-center justify-center break-all">
          <p className="text-2xl font-bold text-navy-700 dark:text-white">
            {student.admissionNumber}
          </p>
          <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
            Student Number
          </p>
        </div>
        <div className="flex flex-col items-center justify-center break-all">
          <p className="text-2xl font-bold text-navy-700 dark:text-white">
            {student.campus}
          </p>
          <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
            Campus
          </p>
        </div>
        <div className="flex flex-col items-center justify-center break-all">
          <p
            className={`text-2xl font-bold ${
              0 > 0 ? "text-red-500" : "text-navy-700"
            } dark:text-white`}
          >
            R 0
          </p>
          <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
            Arrears
          </p>
        </div>
        <div className="flex flex-col items-center justify-center break-all">
          <p className="text-2xl font-bold text-navy-700 dark:text-white"></p>
          <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
            Due Date
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentDetails;
