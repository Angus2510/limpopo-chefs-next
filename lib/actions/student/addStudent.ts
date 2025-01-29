"use server";

import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/utils/emailService";
import { studentCreationTemplate } from "@/lib/email-templates/addingStudent";

// Enum definitions with explicit type safety
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

/**
 * Generates a secure random password
 * @param length - Desired password length
 * @returns Randomly generated password string
 */
const generatePassword = (length: number = 6): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  return Array.from(crypto.getRandomValues(new Uint32Array(length)))
    .map((x) => chars[x % chars.length])
    .join("");
};

/**
 * Type-safe method to extract form data with fallback and type conversion
 * @param formData - FormData object
 * @param key - Key to extract
 * @param defaultValue - Fallback value if key not found
 * @returns Extracted and type-converted value
 */
const safeFormDataGet = (
  formData: FormData,
  key: string,
  defaultValue: string = ""
): string => {
  const value = formData.get(key);
  return value ? String(value) : defaultValue;
};

/**
 * Comprehensive student creation function with enhanced error handling
 * @param input - FormData or plain object input for student creation
 * @returns Created student record
 */
export async function createStudent(input: FormData | Record<string, any>) {
  // Refined input normalization
  const formData =
    input instanceof FormData
      ? input
      : Object.entries(input).reduce((fd, [key, value]) => {
          fd.append(key, value);
          return fd;
        }, new FormData());

  // Comprehensive input logging for debugging
  console.log("Input Processing:", {
    inputType: input.constructor.name,
    inputKeys: Array.from(formData.keys()),
  });

  try {
    // Extract and validate core academic references
    const campus = safeFormDataGet(formData, "campus");
    const intakeGroup = safeFormDataGet(formData, "intakeGroup");
    const qualification = safeFormDataGet(formData, "qualification");

    // Guardian Creation Process
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

    // Create guardians and collect their IDs
    const createdGuardians = await Promise.all(
      guardiansData.map((guardian) =>
        prisma.guardians.create({ data: guardian })
      )
    );
    const guardianIds = createdGuardians.map((guardian) => guardian.id);

    // Gender validation with fallback
    const genderValue = safeFormDataGet(formData, "gender");
    const gender = Gender[genderValue as keyof typeof Gender] || Gender.Other;

    // Generate and hash student password
    const studentPassword = generatePassword();
    const hashedStudentPassword = await bcrypt.hash(studentPassword, 10);

    // Comprehensive student data preparation
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

    // Detailed logging before database insertion
    console.log("Prepared Student Data:", JSON.stringify(studentData, null, 2));

    // Student creation with comprehensive error handling
    const student = await prisma.students.create({
      data: studentData,
    });

    // Generate the email content
    const emailBody = studentCreationTemplate(
      student.profile.firstName,
      student.username,
      studentPassword // Unhashed password
    );

    // Send the email
    await sendEmail(
      student.email,
      "Welcome to Limpopo Chefs Academy",
      emailBody
    );

    console.log("Student Successfully Created and Email Sent:", student.id);

    console.log("Student Successfully Created:", student.id);
    return student;
  } catch (error) {
    // Enhanced error logging and reporting
    if (error instanceof Error) {
      console.error("Student Creation Error", {
        message: error.message,
        stack: error.stack,
        inputKeys: Array.from(formData.keys()),
      });
    } else {
      console.error("Student Creation Error", {
        message: String(error),
        inputKeys: Array.from(formData.keys()),
      });
    }

    throw new Error(
      `Student Creation Failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
