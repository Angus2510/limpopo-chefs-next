"use client";

import { Header } from "./sections/Header";
import { StudentInfo } from "./sections/StudentInfo";
import { AddressInfo } from "./sections/AddressInfo";
import { GuardianInfo } from "./sections/GuardianInfo";
import { TabsContainer } from "./tabs/TabsContainer";
import { StudentViewProps } from "./types";

export default function StudentView({ data }: StudentViewProps) {
  const {
    student,
    guardians = [],
    results = [],
    finances = {},
    documents = [],
  } = data;

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
        studentId={student.id}
      />
    </div>
  );
}
