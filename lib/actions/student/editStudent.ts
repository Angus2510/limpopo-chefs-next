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

  console.log("Received form data:", Array.from(formData.entries()));

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

  const guardiansData: any[] = [];
  const guardianIndices: Set<number> = new Set();

  for (const [key] of formData.entries()) {
    const match = key.match(/guardians\[(\d+)\]\./);
    if (match) {
      guardianIndices.add(parseInt(match[1], 10));
    }
  }

  for (const index of guardianIndices) {
    const guardianId = formData.get(`guardians[${index}].id`) as string;
    const password = generatePassword(12);
    const hashedPassword = guardianId
      ? undefined
      : await bcrypt.hash(password, 10);

    const guardian = {
      id: guardianId || undefined,
      firstName: formData.get(`guardians[${index}].firstName`) as string,
      lastName: formData.get(`guardians[${index}].lastName`) as string,
      email: formData.get(`guardians[${index}].email`) as string,
      mobileNumber: formData.get(`guardians[${index}].phoneNumber`) as string,
      relation: formData.get(`guardians[${index}].relation`) as Relation,
      password: hashedPassword,
    };

    if (
      !guardiansData.some(
        (g) =>
          g.firstName === guardian.firstName && g.lastName === guardian.lastName
      )
    ) {
      guardiansData.push(guardian);
    }
  }

  try {
    const updatedGuardians = await Promise.all(
      guardiansData.map(async (guardian) => {
        if (guardian.id) {
          return prisma.guardians.update({
            where: { id: guardian.id },
            data: guardian,
          });
        } else {
          const newGuardian = await prisma.guardians.create({
            data: guardian,
          });
          return newGuardian;
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

    const student = await prisma.students.update({
      where: { id: studentId },
      data: {
        admissionNumber,
        email,
        campus: campus ? [campus] : [],
        intakeGroup: intakeGroup ? [intakeGroup] : [],
        qualification: qualification ? [qualification] : [],
        guardians: allGuardianIds,
        profile: {
          update: profileData,
        },
      },
    });

    console.log("Student updated:", student);

    // Check if the avatar is present in the FormData and upload it
    if (formData.has("avatar")) {
      formData.append("userId", student.id); // Attach student ID for avatar upload
      try {
        const avatarResult = await uploadAvatar(formData);
        console.log("Avatar upload result:", avatarResult);
      } catch (avatarError) {
        console.error("Avatar upload failed:", avatarError);
      }
    }

    return student;
  } catch (error) {
    console.error("Error updating student:", error);
    throw new Error("Failed to update student");
  }
}
