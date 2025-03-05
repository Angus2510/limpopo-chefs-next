"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/formatDate";
import { Student } from "../types";

interface StudentInfoProps {
  student: Student;
}

export function StudentInfo({ student }: StudentInfoProps) {
  const { profile = {} } = student || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar/Photo */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 relative rounded-md overflow-hidden border">
              {student?.avatarUrl ? (
                <Image
                  src={student.avatarUrl}
                  alt={`${profile?.firstName || ""} ${profile?.lastName || ""}`}
                  fill
                  style={{ objectFit: "cover" }}
                  unoptimized={true}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-3xl">
                    {profile?.firstName?.[0] || ""}
                    {profile?.lastName?.[0] || ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField
              label="Name"
              value={`${profile?.firstName || ""} ${
                profile?.middleName || ""
              } ${profile?.lastName || ""}`}
            />
            <InfoField label="ID Number" value={profile?.idNumber} />
            <InfoField
              label="Date of Birth"
              value={formatDate(profile?.dateOfBirth)}
            />
            <InfoField label="Gender" value={profile?.gender} />
            <InfoField label="Email" value={student?.email} />
            <InfoField label="Mobile Number" value={profile?.mobileNumber} />
            <InfoField
              label="Admission Number"
              value={student?.admissionNumber}
            />
            <InfoField
              label="Admission Date"
              value={formatDate(profile?.admissionDate)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <InfoField label="Campus" value={student?.campusTitle} />
          <InfoField
            label="Qualification"
            value={student?.qualificationTitle}
          />
          <InfoField label="Intake Group" value={student?.intakeGroupTitle} />
          <InfoField
            label="Status"
            value={student?.active ? "Active" : "Inactive"}
          />
          <InfoField
            label="City & Guild Number"
            value={profile?.cityAndGuildNumber}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface InfoFieldProps {
  label: string;
  value?: string | null;
}

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500">{label}</h3>
      <p>{value || "N/A"}</p>
    </div>
  );
}
