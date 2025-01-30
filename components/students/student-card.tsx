import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
}

interface Student {
  id: string;
  profile: Profile;
  intakeGroup: string[];
  campus: string;
  admissionNumber: string;
}

interface StudentCardProps {
  studentData: Student;
}

export function StudentCard({ studentData }: StudentCardProps) {
  if (!studentData) return <p>Loading...</p>;

  const { profile, campus, admissionNumber, intakeGroup } = studentData;
  const { firstName, lastName, email, profilePicture } = profile;

  return (
    <Card className="w-[350px] shadow-lg p-4">
      <CardHeader className="flex justify-between items-start">
        <Avatar className="h-28 w-28">
          <AvatarImage
            src={profilePicture || "/placeholder.svg"}
            alt={`${firstName} ${lastName}`}
          />
          <AvatarFallback>
            {firstName?.[0]}
            {lastName?.[0]}
          </AvatarFallback>
        </Avatar>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex">
            <span className="font-semibold w-32">Name:</span>
            <span>
              {firstName} {lastName}
            </span>
          </div>
          <div className="flex">
            <span className="font-semibold w-32">Campus:</span>
            <span>{campus}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-32">Student number:</span>
            <span>{admissionNumber}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-32">Email address:</span>
            <span>{email}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-32">Intake Group:</span>
            <span>{intakeGroup.join(", ")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
