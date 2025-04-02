"use server";

import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import sendEmailNotification from "@/utils/emailService";
import { studentCreationTemplate } from "@/lib/email-templates/addingStudent";
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

const generatePassword = (length: number = 6): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  return Array.from(crypto.getRandomValues(new Uint32Array(length)))
    .map((x) => chars[x % chars.length])
    .join("");
};

const safeFormDataGet = (
  formData: FormData,
  key: string,
  defaultValue: string = ""
): string => {
  const value = formData.get(key);
  if (!value) return defaultValue;

  // Handle ISO date strings
  if (typeof value === "string" && value.includes("T")) {
    return new Date(value).toISOString();
  }

  return String(value);
};

export async function createStudent(input: FormData | Record<string, any>) {
  // Normalize input to FormData
  const formData =
    input instanceof FormData
      ? input
      : Object.entries(input).reduce((fd, [key, value]) => {
          fd.append(key, value);
          return fd;
        }, new FormData());

  console.log("Input keys:", Array.from(formData.keys()));

  try {
    // Extract common fields
    const campus = safeFormDataGet(formData, "campus");
    const intakeGroup = safeFormDataGet(formData, "intakeGroup");
    const qualification = safeFormDataGet(formData, "qualification");

    // Process guardians (if any)
    const guardiansData = [];
    for (let i = 0; formData.has(`guardians[${i}].firstName`); i++) {
      const relationValue = safeFormDataGet(
        formData,
        `guardians[${i}].relation`
      );
      const relation =
        Relation[relationValue as keyof typeof Relation] || Relation.Other;

      const guardianPassword = generatePassword();
      const hashedGuardianPassword = await bcrypt.hash(guardianPassword, 10);

      guardiansData.push({
        firstName: safeFormDataGet(formData, `guardians[${i}].firstName`),
        lastName: safeFormDataGet(formData, `guardians[${i}].lastName`),
        email: safeFormDataGet(formData, `guardians[${i}].email`),
        mobileNumber: safeFormDataGet(formData, `guardians[${i}].phoneNumber`),
        relation,
        password: hashedGuardianPassword,
        v: 1,
        userType: "guardian",
      });
    }

    // Create guardian records
    const createdGuardians = await Promise.all(
      guardiansData.map((guardian) =>
        prisma.guardians.create({ data: guardian })
      )
    );
    const guardianIds = createdGuardians.map((guardian) => guardian.id);

    // Validate gender with fallback
    const genderValue = safeFormDataGet(formData, "gender");
    const gender = Gender[genderValue as keyof typeof Gender] || Gender.Other;

    // Create student password
    const studentPassword = generatePassword();
    const hashedStudentPassword = await bcrypt.hash(studentPassword, 10);

    // Prepare student data
    const studentData = {
      admissionNumber: safeFormDataGet(formData, "admissionNumber"),
      email: safeFormDataGet(formData, "email"),
      username: safeFormDataGet(formData, "admissionNumber"),
      password: hashedStudentPassword,
      profile: {
        firstName: safeFormDataGet(formData, "firstName"),
        middleName: safeFormDataGet(formData, "middleName"),
        lastName: safeFormDataGet(formData, "lastName"),
        idNumber: safeFormDataGet(formData, "idNumber"),
        dateOfBirth: safeFormDataGet(formData, "dateOfBirth"),
        gender,
        homeLanguage: safeFormDataGet(formData, "homeLanguage"),
        mobileNumber: safeFormDataGet(formData, "mobileNumber"),
        cityAndGuildNumber: safeFormDataGet(formData, "cityAndGuildNumber"),
        admissionDate: safeFormDataGet(formData, "admissionDate"),
        address: {
          street1: safeFormDataGet(formData, "street1"),
          street2: safeFormDataGet(formData, "street2"),
          city: safeFormDataGet(formData, "city"),
          province: safeFormDataGet(formData, "province"),
          country: safeFormDataGet(formData, "country"),
          postalCode: safeFormDataGet(formData, "postalCode"),
        },
        postalAddress: {
          street1: safeFormDataGet(formData, "street1"),
          street2: safeFormDataGet(formData, "street2"),
          city: safeFormDataGet(formData, "city"),
          province: safeFormDataGet(formData, "province"),
          country: safeFormDataGet(formData, "country"),
          postalCode: safeFormDataGet(formData, "postalCode"),
        },
      },
      campus: campus ? [campus] : [],
      intakeGroup: intakeGroup ? [intakeGroup] : [],
      qualification: qualification ? [qualification] : [],
      guardians: guardianIds,
      v: 1,
      active: true,
      agreementAccepted: true,
      mustChangePassword: false,
      updatedAt: new Date(),
      userType: "student",
    };

    console.log("Creating student with data:", studentData);

    // Create the student record first
    const student = await prisma.students.create({
      data: studentData,
    });

    // Handle avatar upload if provided
    if (formData.has("avatar")) {
      const avatarFile = formData.get("avatar") as File;

      // Only process if there's actually a file with content
      if (avatarFile && avatarFile.size > 0) {
        // Create a new FormData specifically for the avatar upload
        const avatarFormData = new FormData();
        avatarFormData.append("avatar", avatarFile);
        avatarFormData.append("userId", student.id);

        try {
          const avatarResult = await uploadAvatar(avatarFormData);
          console.log("Avatar upload result:", avatarResult);

          // If we got a URL back, update the student record
          if (avatarResult && avatarResult.avatarUrl) {
            await prisma.students.update({
              where: { id: student.id },
              data: {
                avatarUrl: avatarResult.avatarUrl,
              },
            });

            console.log(
              `Updated student ${student.id} with avatarUrl: ${avatarResult.avatarUrl}`
            );
          }
        } catch (avatarError) {
          console.error("Avatar upload failed:", avatarError);
          // Continue without avatar if upload fails
        }
      }
    }

    // Generate and send the welcome email
    const emailBody = studentCreationTemplate(
      student.profile.firstName,
      student.username,
      studentPassword // Send the unhashed password via email
    );
    await sendEmailNotification(
      student.email,
      "Welcome to Limpopo Chefs Academy",
      emailBody
    );

    console.log("Student created and email sent:", student.id);
    return student;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Student Creation Error", {
        message: error.message,
        stack: error.stack,
        keys: Array.from(formData.keys()),
      });
    } else {
      console.error("Student Creation Error", {
        message: String(error),
        keys: Array.from(formData.keys()),
      });
    }
    throw new Error(
      `Student Creation Failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
