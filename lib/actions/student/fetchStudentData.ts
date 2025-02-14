"use server";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import prisma from "@/lib/db";
import useAuthStore from "@/store/authStore"; // Adjust this import according to your project structure

export async function fetchStudentData(studentId?: string) {
  try {
    // Retrieve token from both cookies and the auth store
    const tokenFromStore = useAuthStore.getState().getToken();
    const tokenFromCookies = (await cookies()).get("accessToken")?.value;

    console.log("Token from auth store:", tokenFromStore);
    console.log("Token from cookies:", tokenFromCookies);

    const token = tokenFromStore || tokenFromCookies;
    if (!token) {
      throw new Error("No token found");
    }

    // Decode and validate the token
    const decoded = jwtDecode(token);
    if (decoded.exp < Date.now() / 1000) {
      throw new Error("Token expired");
    }
    if (!["Student", "Staff"].includes(decoded.userType)) {
      throw new Error("Unauthorized access");
    }

    // Determine student ID based on the user type:
    const targetStudentId =
      decoded.userType === "Student" ? decoded.id : studentId;
    if (!targetStudentId) {
      throw new Error("Student ID is required for staff members");
    }

    // Query the database using Prisma for the student record.
    const student = await prisma.students.findUnique({
      where: { id: targetStudentId },
      select: {
        id: true,
        admissionNumber: true,
        email: true,
        avatarUrl: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            idNumber: true,
          },
        },
        inactiveReason: true,
        campus: true, // Stored as an array, a comma-separated string, or a single value
        intakeGroup: true, // Stored similarly
      },
    });
    if (!student) {
      throw new Error("Student not found");
    }

    // --- Coerce the campus and intakeGroup values into arrays ---
    const campusArray =
      typeof student.campus === "string"
        ? student.campus
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : Array.isArray(student.campus)
        ? student.campus
        : student.campus
        ? [student.campus]
        : [];
    const intakeGroupArray =
      typeof student.intakeGroup === "string"
        ? student.intakeGroup
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : Array.isArray(student.intakeGroup)
        ? student.intakeGroup
        : student.intakeGroup
        ? [student.intakeGroup]
        : [];

    // --- Fetch related campus and intake group titles ---
    const campuses = await prisma.campus.findMany({
      where: { id: { in: campusArray } },
      select: { id: true, title: true },
    });
    const campusMap = campuses.reduce((acc, campus) => {
      acc[campus.id] = campus.title;
      return acc;
    }, {} as Record<string, string>);

    const intakeGroups = await prisma.intakegroups.findMany({
      where: { id: { in: intakeGroupArray } },
      select: { id: true, title: true },
    });
    const intakeGroupMap = intakeGroups.reduce((acc, group) => {
      acc[group.id] = group.title;
      return acc;
    }, {} as Record<string, string>);

    // Map the IDs to their corresponding titles.
    const studentWithTitles = {
      ...student,
      campus: campusArray.map((id: string) => campusMap[id] || id).join(", "),
      intakeGroup: intakeGroupArray.map(
        (id: string) => intakeGroupMap[id] || id
      ),
    };

    // Fetch related data from the database in parallel
    const [
      // Fetch wellness records with all details.
      wellnessRecords,
      rawResults,
      learningMaterials,
      events,
      finances,
      documents,
    ] = await Promise.all([
      prisma.studentwelrecords.findMany({
        where: { student: targetStudentId },
        select: {
          id: true, // _id mapped to id in Prisma
          student: true,
          welRecords: true, // Array of well record details
          createdAt: true,
          updatedAt: true,
          // Removed __v because it's not defined in the model
        },
      }),
      // Fetch results records with nested filtering on the student's id.
      prisma.results.findMany({
        where: {
          results: {
            some: {
              student: targetStudentId,
            },
          },
        },
        select: {
          id: true,
          title: true,
          results: true, // We'll filter the nested results in JavaScript.
        },
      }),
      prisma.learningmaterials.findMany({
        where: { intakeGroup: { hasSome: intakeGroupArray } },
      }),
      prisma.events.findMany({
        where: { assignedTo: { has: targetStudentId } },
      }),
      prisma.finances.findFirst({
        where: { student: targetStudentId },
      }),
      prisma.generaldocuments.findMany({
        where: { student: targetStudentId },
      }),
    ]);

    // Now, filter the nested `results` for each record so only those with student === targetStudentId remain
    const results = rawResults.map((record) => ({
      ...record,
      results: record.results.filter(
        (nestedResult) => nestedResult.student === targetStudentId
      ),
    }));

    return {
      student: studentWithTitles,
      wellnessRecords,
      results,
      learningMaterials,
      events,
      finances,
      documents,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching student data:", error.message);
    } else {
      console.error("Error fetching student data:", error);
    }
    throw error;
  }
}
