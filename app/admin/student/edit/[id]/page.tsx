import React from "react";
import { ContentLayout } from "@/components/layout/content-layout";
import EditStudentForm from "@/components/forms/student/editStudent";
import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";
import { getAllCampuses } from "@/lib/actions/campus/campuses";
import { getAllQualifications } from "@/lib/actions/qualification/action";
import { getAllAccommodations } from "@/lib/actions/accommodation/action";
import { fetchStudentData } from "@/lib/actions/student/fetchStudentData";
import { notFound } from "next/navigation";
import type { Student } from "@/types/student/studentData";

interface EditStudentPageProps {
  params: {
    id: string;
  };
}

export default async function EditStudentPage({
  params,
}: EditStudentPageProps) {
  try {
    // Properly handle the ID parameter
    const studentId = params.id;
    if (!studentId) {
      notFound();
    }

    // Fetch general data and student data in parallel
    const [
      intakeGroups,
      campuses,
      qualifications,
      accommodations,
      studentAllData,
    ] = await Promise.all([
      getAllIntakeGroups(),
      getAllCampuses(),
      getAllQualifications(),
      getAllAccommodations(),
      fetchStudentData(studentId),
    ]);

    if (!studentAllData?.student) {
      notFound();
    }

    // Format student data with proper fallback values
    const formattedStudentData = {
      id: studentAllData.student.id,
      admissionNumber: studentAllData.student.admissionNumber || "",
      email: studentAllData.student.email || "",
      profile: {
        firstName: studentAllData.student.profile?.firstName || "",
        middleName: studentAllData.student.profile?.middleName || "",
        lastName: studentAllData.student.profile?.lastName || "",
        idNumber: studentAllData.student.profile?.idNumber || "",
        dateOfBirth: studentAllData.student.profile?.dateOfBirth || "",
        gender: studentAllData.student.profile?.gender || "",
        homeLanguage: studentAllData.student.profile?.homeLanguage || "",
        mobileNumber: studentAllData.student.profile?.mobileNumber || "",
        cityAndGuildNumber:
          studentAllData.student.profile?.cityAndGuildNumber || "",
        admissionDate: studentAllData.student.profile?.admissionDate || "",
        address: {
          street1: studentAllData.student.profile?.address?.street1 || "",
          street2: studentAllData.student.profile?.address?.street2 || "",
          city: studentAllData.student.profile?.address?.city || "",
          province: studentAllData.student.profile?.address?.province || "",
          country: studentAllData.student.profile?.address?.country || "",
          postalCode: studentAllData.student.profile?.address?.postalCode || "",
        },
      },
      // Handle arrays properly
      campus:
        typeof studentAllData.student.campus === "string"
          ? [studentAllData.student.campus]
          : studentAllData.student.campus || [],
      intakeGroup: Array.isArray(studentAllData.student.intakeGroup)
        ? studentAllData.student.intakeGroup
        : [studentAllData.student.intakeGroup].filter(Boolean),
      qualification: Array.isArray(studentAllData.student.qualification)
        ? studentAllData.student.qualification
        : studentAllData.student.qualification
        ? [studentAllData.student.qualification]
        : [],
      guardians: studentAllData.student.guardians || [],
    };

    // Debug log to verify data structure
    console.log(
      "Formatted Student Data:",
      JSON.stringify(formattedStudentData, null, 2)
    );

    return (
      <ContentLayout
        title={`Edit Student: ${formattedStudentData.profile.firstName} ${formattedStudentData.profile.lastName}`}
      >
        <EditStudentForm
          student={formattedStudentData}
          intakeGroups={intakeGroups || []}
          campuses={campuses || []}
          qualifications={qualifications || []}
          accommodations={accommodations || []}
        />
      </ContentLayout>
    );
  } catch (error) {
    console.error("Error in EditStudentPage:", error);
    return (
      <ContentLayout title="Error">
        <div className="text-red-500 p-4">
          {error instanceof Error
            ? error.message
            : "Failed to load student data"}
        </div>
      </ContentLayout>
    );
  }
}
