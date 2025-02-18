"use server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { uploadAvatar } from "@/lib/actions/uploads/uploadAvatar"; // Adjust the path if needed

enum Relation {
  Father = "Father",
  Mother = "Mother",
  Guardian = "Guardian",
  Other = "Other",
}

enum Gender {
  Male = "Male",
  Female = "Female",
  Other = "Other",
}

const generatePassword = (length: number) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export async function updateStudent(formData: FormData) {
  const studentId = formData.get("id") as string;

  try {
    console.log("Received form data:", Array.from(formData.entries()));

    // Handle avatar upload first if present
    let avatarUrl;
    if (formData.has("avatar")) {
      try {
        const avatarResult = await uploadAvatar(formData);
        avatarUrl = avatarResult.avatarUrl;
        console.log("Avatar upload successful:", avatarUrl);
      } catch (avatarError) {
        console.error("Avatar upload failed:", avatarError);
      }
    }

    // Keep existing data extraction
    const campus = formData.get("campus") as string;
    const intakeGroup = formData.get("intakeGroup") as string;
    const qualification = formData.get("qualification") as string;
    const admissionNumber = formData.get("admissionNumber") as string;
    const email = formData.get("email") as string;

    const profileData = {
      firstName: formData.get("firstName") as string,
      middleName: (formData.get("middleName") as string) || "",
      lastName: formData.get("lastName") as string,
      idNumber: formData.get("idNumber") as string,
      dateOfBirth: (formData.get("dateOfBirth") as string) || "",
      gender: formData.get("gender") as Gender,
      homeLanguage: (formData.get("homeLanguage") as string) || "",
      mobileNumber: formData.get("mobileNumber") as string,
      cityAndGuildNumber: (formData.get("cityAndGuildNumber") as string) || "",
      admissionDate: (formData.get("admissionDate") as string) || "",
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
    };

    // Keep existing guardian processing
    const guardiansData: any[] = [];
    const guardianIndices: Set<number> = new Set();

    for (const [key] of formData.entries()) {
      const match = key.match(/guardians\[(\d+)\]\./);
      if (match) {
        guardianIndices.add(parseInt(match[1], 10));
      }
    }

    // ... keep existing guardian processing ...

    const updatedGuardians = await Promise.all(
      guardiansData.map(async (guardian) => {
        if (guardian.id) {
          return prisma.guardians.update({
            where: { id: guardian.id },
            data: guardian,
          });
        } else {
          return prisma.guardians.create({
            data: guardian,
          });
        }
      })
    );

    const guardianIds = updatedGuardians.map((guardian) => guardian.id);
    const existingStudent = await prisma.students.findUnique({
      where: { id: studentId },
      select: { guardians: true },
    });

    if (!existingStudent) {
      throw new Error("Student not found");
    }

    const allGuardianIds = Array.from(
      new Set([...existingStudent.guardians, ...guardianIds])
    );

    // Update student with all data including avatar
    const student = await prisma.students.update({
      where: { id: studentId },
      data: {
        admissionNumber,
        email,
        campus: campus ? [campus] : [],
        intakeGroup: intakeGroup ? [intakeGroup] : [],
        qualification: qualification ? [qualification] : [],
        guardians: allGuardianIds,
        ...(avatarUrl && { avatarUrl }), // Only update avatarUrl if we have a new one
        profile: {
          update: profileData,
        },
      },
    });

    console.log("Student updated successfully:", student);
    return student;
  } catch (error) {
    console.error("Error updating student:", error);
    throw new Error("Failed to update student");
  }
}
