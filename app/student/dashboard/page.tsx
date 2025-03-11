"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { fetchStudentData } from "@/lib/actions/student/fetchStudentData";
import { StudentCard } from "@/components/students/student-card";
import { ContentLayout } from "@/components/layout/content-layout";
import { TodaysSchedule } from "@/components/students/todaysSchedule";
import WeeklyCalendarCard from "@/components/students/weekly-calendar-card";
import { FeesCard } from "@/components/students/student-fees";
import WelHoursCard from "@/components/students/wel-card";
import StudentMaterialsCard from "@/components/students/student-learning-materials-card";

// Define interfaces based on your API response
interface Profile {
  firstName: string;
  lastName: string;
  email?: string; // Make email optional here
}

interface Student {
  id: string;
  profile: Profile;
  intakeGroup: string[];
  campus: string;
  admissionNumber: string;

  // Add these fields explicitly since they're being set in fetchStudentData
  email: string; // This is now at root level
  campusTitle: string; // The human-readable campus name
  intakeGroupTitle: string; // The human-readable intake group name
  qualificationTitle?: string;
}

interface WellnessRecord {
  id: string;
  student: string;
  hours: number;
  date: string;
  activity: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface Result {
  id: string;
  participants: string[];
}

interface LearningMaterial {
  id: string;
  intakeGroup: string[];
}
interface Event {
  id: string;
  title: string;
  startDate: string; // Changed from startTime
  endDate: string | null; // Changed from endTime
  details?: string;
  location?: string[];
  color: string;
  assignedToModel: string[]; // Changed from assignedTo
  type?: "CLASS" | "MEETING" | "ASSIGNMENT" | "OTHER";
}

interface Finance {
  id: string;
  student: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: "PAID" | "PENDING" | "OVERDUE";
}

interface Document {
  id: string;
  student: string;
}

interface StudentData {
  student: Student;
  wellnessRecords: WellnessRecord[];
  results: Result[];
  learningMaterials: LearningMaterial[];
  events: Event[];
  finances: Finance | null;
  documents: Document[];
}

export default function ProtectedStudentDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, getToken, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);

  useEffect(() => {
    const authenticateAndFetchData = async () => {
      try {
        if (!isAuthenticated()) {
          console.log("Not authenticated, redirecting to login");
          router.push("/login");
          return;
        }

        if (user?.userType !== "Student") {
          console.log("Unauthorized access attempt");
          router.push("/unauthorized");
          return;
        }

        const token = getToken();
        if (!token) throw new Error("No token found");

        const response = await fetch("/api/validate-token", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-User-Type": "student",
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Token validation failed");
        }

        // Fetch student data after authentication
        const data = await fetchStudentData();
        setStudentData(data);
      } catch (error) {
        console.error("Authentication error:", error);
        setError(
          error instanceof Error ? error.message : "Authentication failed"
        );
        logout();
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    authenticateAndFetchData();
  }, [router, user, isAuthenticated, getToken, logout]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="animate-pulse text-xl font-semibold">
            Loading Student Dashboard...
          </div>
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500">Please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated() || !studentData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-gray-500">
          <p>Student data not available.</p>
        </div>
      </div>
    );
  }

  const { student, wellnessRecords, results, events, finances } = studentData;

  // Update the return statement with adjusted sizing
  return (
    <div className="min-h-screen bg-primary-200">
      <ContentLayout title="Student Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-min gap-4">
          {/* First row */}
          <div className="w-full max-w-sm">
            <StudentCard studentData={student} />
          </div>
          <div className="w-full max-w-sm">
            <TodaysSchedule
              studentId={user.id}
              intakeGroup={student.intakeGroup[0]}
            />
          </div>
          <div className="w-full max-w-sm space-y-4">
            <WelHoursCard
              studentData={student}
              wellnessRecords={wellnessRecords}
            />
            <FeesCard studentData={student} finances={finances} />
          </div>

          {/* Second row - Full width calendar and materials */}
          <div className="md:col-span-2 lg:col-span-3">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 min-w-0">
                <WeeklyCalendarCard studentData={student} events={events} />
              </div>
              <div className="w-full lg:w-1/3 min-w-0">
                <StudentMaterialsCard
                  student={student}
                  learningMaterials={studentData.learningMaterials}
                />
              </div>
            </div>
          </div>
        </div>
      </ContentLayout>
    </div>
  );
}
