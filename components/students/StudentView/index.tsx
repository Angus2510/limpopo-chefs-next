"use client";

import { Header } from "./sections/Header";
import { StudentInfo } from "./sections/StudentInfo";
import { AddressInfo } from "./sections/AddressInfo";
import { GuardianInfo } from "./sections/GuardianInfo";
import { TabsContainer } from "./tabs/TabsContainer";

export interface Student {
  id: string;
  email: string;
  profile: {
    address?: any;
  };
  mappedTitles: {
    campus: string;
    intakeGroup: string;
    email: string;
  };
}

export interface StudentViewProps {
  data: {
    student: Student;
    guardians: any[];
    results: any[];
    finances: any;
    documents: any[];
  };
}

export default function StudentView({ data }: StudentViewProps) {
  const {
    student,
    guardians = [],
    results = [],
    finances = {},
    documents = [],
  } = data;

  // Use intakeGroupTitle instead of mappedTitles
  const intakeGroup = student?.intakeGroupTitle || "";

  console.log("StudentView rendering with:", {
    intakeGroup,
    studentId: student?.id,
    hasResults: results?.length,
  });

  return (
    <div className="space-y-6">
      <Header />
      <StudentInfo student={student} />
      <AddressInfo address={student?.profile?.address} />
      <GuardianInfo guardians={guardians} />

      <TabsContainer
        results={results}
        finances={finances}
        documents={documents}
        studentId={student?.id || ""}
        intakeGroup={intakeGroup}
      />
    </div>
  );
}
