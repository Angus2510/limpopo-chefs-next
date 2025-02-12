"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import StudentView from "@/components/students/StudentView";
import { fetchCompleteStudentData } from "@/lib/actions/student/fetchCompleteStudentData";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  admissionNumber: string;
  active: boolean;
  dateOfBirth: string;
  gender: string;
  mobileNumber: string;
  email: string;
  admissionDate: string;
  campus: string;
  intakeGroup: string;
  qualification?: string[];
  currentResult?: string;
  welRecords?: any[];
  finances?: any[];
  documents?: any[];
  guardians?: any[];
  attendances?: any[];
};

const StudentViewPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<Student | null>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await fetchCompleteStudentData(id);
        setStudentData(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData(); // Correct the typo
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Student not found</div>
      </div>
    );
  }

  return (
    <StudentView
      student={studentData}
      welRecords={studentData.welRecords || []}
      finances={studentData.finances || []}
      documents={studentData.documents || []}
      guardians={studentData.guardians || []}
      attendances={studentData.attendances || []}
    />
  );
};

export default StudentViewPage;
