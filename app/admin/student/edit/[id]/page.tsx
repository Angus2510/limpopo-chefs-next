import React from "react";
import { ContentLayout } from "@/components/layout/content-layout";
import EditStudentForm from "@/components/forms/student/editStudent";
import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";
import { getAllCampuses } from "@/lib/actions/campus/campuses";
import { getAllQualifications } from "@/lib/actions/qualification/action";
import { getAllAccommodations } from "@/lib/actions/accommodation/action";
import { fetchStudentData } from "@/lib/actions/student/fetchStudentData";
import type { Student } from "@/types/student";

interface EditStudentPageProps {
  params: {
    id: string;
  };
}

export default async function EditStudentPage({
  params,
}: EditStudentPageProps) {
  try {
    if (!params?.id) {
      return (
        <ContentLayout title="Error">
          <div className="flex items-center justify-center p-4">
            <div className="text-red-500">Invalid student ID</div>
          </div>
        </ContentLayout>
      );
    }

    // Fetch general data and student data in parallel
    const [
      intakeGroups,
      campuses,
      qualifications,
      accommodations,
      studentAllData,
    ] = await Promise.all([
      getAllIntakeGroups().catch(() => []),
      getAllCampuses().catch(() => []),
      getAllQualifications().catch(() => []),
      getAllAccommodations().catch(() => []),
      fetchStudentData(params.id).catch((error) => {
        console.error("Error fetching student data:", error);
        return null;
      }),
    ]);

    if (!studentAllData?.student) {
      return (
        <ContentLayout title="Error">
          <div className="flex items-center justify-center p-4">
            <div className="text-red-500">Student not found</div>
          </div>
        </ContentLayout>
      );
    }

    // Combine all student data
    const studentWithAllData = {
      ...studentAllData.student,
      wellnessRecords: studentAllData.wellnessRecords || [],
      results: studentAllData.results || [],
      learningMaterials: studentAllData.learningMaterials || [],
      events: studentAllData.events || [],
      finances: studentAllData.finances || null,
      documents: studentAllData.documents || [],
    };

    return (
      <ContentLayout title="Edit Student">
        <EditStudentForm
          student={studentWithAllData}
          intakeGroups={Array.isArray(intakeGroups) ? intakeGroups : []}
          campuses={Array.isArray(campuses) ? campuses : []}
          qualifications={Array.isArray(qualifications) ? qualifications : []}
          accommodations={Array.isArray(accommodations) ? accommodations : []}
        />
      </ContentLayout>
    );
  } catch (error) {
    console.error("Error in EditStudentPage:", error);
    return (
      <ContentLayout title="Error">
        <div className="flex items-center justify-center p-4">
          <div className="text-red-500">
            {error instanceof Error
              ? error.message
              : "Error loading student data. Please try again."}
          </div>
        </div>
      </ContentLayout>
    );
  }
}
