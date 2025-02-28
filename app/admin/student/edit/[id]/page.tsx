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

// Use correct parameter type
type PageParams = {
  id: string;
};

interface EditStudentPageProps {
  params: PageParams;
}

export default async function EditStudentPage(props: EditStudentPageProps) {
  // Fix for Next.js dynamic parameter warning
  // Using the property directly from props instead of destructuring
  const id = props.params.id;

  try {
    console.log("Edit page loading for student ID:", id);

    if (!id) {
      console.log("No student ID provided");
      notFound();
    }

    // Fetch all required data in parallel
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
      fetchStudentData(id),
    ]);

    if (!studentAllData?.student) {
      console.log("No student data found");
      notFound();
    }

    console.log("Student data fetched successfully");

    // Create a fully populated student object with ALL fields
    const formattedStudentData = {
      id: studentAllData.student.id || "",
      active: studentAllData.student.active || false,
      admissionNumber: studentAllData.student.admissionNumber || "",
      email: studentAllData.student.email || "",
      avatarUrl: studentAllData.student.avatarUrl || "",
      agreementAccepted: studentAllData.student.agreementAccepted || false,
      agreementAcceptedDate: studentAllData.student.agreementAcceptedDate || "",
      alumni: studentAllData.student.alumni || false,
      createdAt: studentAllData.student.createdAt || "",
      importantInformation: studentAllData.student.importantInformation || "",
      inactiveReason: studentAllData.student.inactiveReason || "",
      mustChangePassword: studentAllData.student.mustChangePassword || false,
      outcome: studentAllData.student.outcome || "",
      updatedAt: studentAllData.student.updatedAt || "",
      username: studentAllData.student.username || "",
      userType: studentAllData.student.userType || "Student",
      v: studentAllData.student.v || 0,

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

      campus: studentAllData.student.campus || [],
      intakeGroup: studentAllData.student.intakeGroup || [],
      qualification: studentAllData.student.qualification || [],
      currentResult: studentAllData.student.currentResult || "",
      guardians: studentAllData.guardians || [],
      assignments: studentAllData.student.assignments || [],
    };

    console.log("Student data formatted for form");

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
        <div className="text-red-500 p-4 rounded bg-red-50 border border-red-200">
          <h3 className="font-bold mb-2">Error Loading Student Data</h3>
          <p>
            {error instanceof Error
              ? error.message
              : "Failed to load student data"}
          </p>
        </div>
      </ContentLayout>
    );
  }
}
