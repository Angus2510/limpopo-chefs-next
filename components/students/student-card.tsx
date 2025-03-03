import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Profile {
  firstName: string;
  lastName: string;
  email?: string;
  profilePicture?: string;
}

interface Student {
  id: string;
  profile: Profile;
  intakeGroup: string[];
  campus: string;
  admissionNumber: string;
  avatarUrl?: string;

  // Add these properties that are set in fetchStudentData.ts
  email: string;
  campusTitle: string;
  intakeGroupTitle: string;
  qualificationTitle?: string;
}

interface StudentCardProps {
  studentData: Student;
}

export function StudentCard({ studentData }: StudentCardProps) {
  if (!studentData) return <p>Loading...</p>;

  const { profile, admissionNumber } = studentData;
  const { firstName, lastName, profilePicture } = profile;

  // For debugging - remove in production
  console.log("Student data in card:", {
    email: studentData.email,
    campus: studentData.campus,
    campusTitle: studentData.campusTitle,
    intakeGroup: studentData.intakeGroup,
    intakeGroupTitle: studentData.intakeGroupTitle,
  });

  return (
    <Card className="max-w-md shadow-lg">
      <CardHeader className="flex justify-between items-start p-4 pb-0">
        <Avatar className="h-28 w-28">
          <AvatarImage
            src={studentData.avatarUrl || "/placeholder.svg"}
            alt={`${firstName} ${lastName}`}
          />
          <AvatarFallback>
            {firstName?.[0]}
            {lastName?.[0]}
          </AvatarFallback>
        </Avatar>
      </CardHeader>
      <CardContent className="p-4 pt-2 pb-4">
        <div className="space-y-2">
          <div className="flex flex-wrap">
            <span className="font-semibold w-32">Name:</span>
            <span className="truncate">
              {firstName} {lastName}
            </span>
          </div>
          <div className="flex flex-wrap">
            <span className="font-semibold w-32">Campus:</span>
            <span className="truncate">{studentData.campusTitle}</span>
          </div>
          <div className="flex flex-wrap">
            <span className="font-semibold w-32">Student number:</span>
            <span className="truncate">{admissionNumber}</span>
          </div>
          <div className="flex flex-wrap">
            <span className="font-semibold w-32">Email address:</span>
            <span className="truncate">{studentData.email}</span>
          </div>
          <div className="flex flex-wrap">
            <span className="font-semibold w-32">Intake Group:</span>
            <span className="truncate">{studentData.intakeGroupTitle}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
