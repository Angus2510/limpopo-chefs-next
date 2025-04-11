import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const studentId = formData.get("id") as string;
    const guardianString = formData.get("guardians");

    // Parse guardian data
    const guardians = guardianString
      ? JSON.parse(guardianString as string)
      : [];

    // Update in transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update student profile first
      const updatedStudent = await tx.students.update({
        where: { id: studentId },
        data: {
          email: formData.get("email") as string,
          admissionNumber: formData.get("admissionNumber") as string,
          campus: [formData.get("campus") as string],
          intakeGroup: [formData.get("intakeGroup") as string],
          qualification: [formData.get("qualification") as string],
          profile: {
            firstName: formData.get("firstName") as string,
            lastName: formData.get("lastName") as string,
            middleName: (formData.get("middleName") as string) || "",
            idNumber: formData.get("idNumber") as string,
            gender: formData.get("gender") as string,
            mobileNumber: formData.get("mobileNumber") as string,
            homeLanguage: (formData.get("homeLanguage") as string) || "",
            cityAndGuildNumber:
              (formData.get("cityAndGuildNumber") as string) || "",
            admissionDate: new Date().toISOString(),
            dateOfBirth: new Date().toISOString(),
            address: {
              street1: formData.get("street1") as string,
              street2: (formData.get("street2") as string) || "",
              city: formData.get("city") as string,
              province: formData.get("province") as string,
              country: formData.get("country") as string,
              postalCode: formData.get("postalCode") as string,
            },
            postalAddress: {
              street1: formData.get("street1") as string,
              street2: (formData.get("street2") as string) || "",
              city: formData.get("city") as string,
              province: formData.get("province") as string,
              country: formData.get("country") as string,
              postalCode: formData.get("postalCode") as string,
            },
          },
        },
      });

      // 2. Remove existing guardians
      await tx.guardians.deleteMany({
        where: { studentId },
      });

      // 3. Create new guardians
      const guardianIds = [];
      for (const guardian of guardians) {
        const newGuardian = await tx.guardians.create({
          data: {
            firstName: guardian.firstName,
            lastName: guardian.lastName,
            email: guardian.email,
            mobileNumber: guardian.mobileNumber,
            relation: guardian.relation,
            userType: "Guardian",
            studentId: studentId,
          },
        });
        guardianIds.push(newGuardian.id);
      }

      // 4. Update student with new guardian IDs
      await tx.students.update({
        where: { id: studentId },
        data: {
          guardians: guardianIds,
        },
      });
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Student and guardians updated successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Update failed:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to update student",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
