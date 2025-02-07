"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import StudentView from "@/components/students/StudentView";
import { fetchStudentData } from "@/lib/actions/student/fetchStudentData";

type Student = {
  id: string;
  welRecords?: any[]; // Change to the actual type if known
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
    const getStudentData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await fetchStudentData(id);
        setStudentData(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    getStudentData();
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
