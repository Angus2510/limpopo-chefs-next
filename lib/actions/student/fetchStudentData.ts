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

    // Query the database using Prisma. We use `select` because campus and intakeGroup are scalar fields.
    const student = await prisma.students.findUnique({
      where: { id: targetStudentId },
      select: {
        id: true,
        admissionNumber: true,
        email: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            idNumber: true,
          },
        },
        inactiveReason: true,
        campus: true, // Expected to be stored as an array, a comma-separated string, or a single value
        intakeGroup: true, // Expected to be stored similarly
      },
    });
    if (!student) {
      throw new Error("Student not found");
    }

    // --- Coerce the campus and intakeGroup values into arrays ---
    // If the value is a comma-separated string, split it into an array.
    const campusArray =
      typeof student.campus === "string"
        ? (student.campus as string)
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
        ? (student.intakeGroup as string)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : Array.isArray(student.intakeGroup)
        ? student.intakeGroup
        : student.intakeGroup
        ? [student.intakeGroup]
        : [];

    // --- Fetch the related titles using the same logic as in getStudentsData ---
    // Fetch campus titles for the campusArray IDs
    const campuses = await prisma.campus.findMany({
      where: { id: { in: campusArray } },
      select: { id: true, title: true },
    });
    const campusMap = campuses.reduce((acc, campus) => {
      acc[campus.id] = campus.title;
      return acc;
    }, {} as Record<string, string>);

    // Fetch intake group titles for the intakeGroupArray IDs
    const intakeGroups = await prisma.intakegroups.findMany({
      where: { id: { in: intakeGroupArray } },
      select: { id: true, title: true },
    });
    const intakeGroupMap = intakeGroups.reduce((acc, group) => {
      acc[group.id] = group.title;
      return acc;
    }, {} as Record<string, string>);

    // Map the IDs to their corresponding titles.
    // For campus, join the titles into a string.
    // For intakeGroup, return an array of titles.
    const studentWithTitles = {
      ...student,
      campus: campusArray.map((id: string) => campusMap[id] || id).join(", "),
      intakeGroup: intakeGroupArray.map(
        (id: string) => intakeGroupMap[id] || id
      ),
    };

    // Fetch related data from the database in parallel
    const [
      wellnessRecords,
      results,
      learningMaterials,
      events,
      finances,
      documents,
    ] = await Promise.all([
      prisma.studentwelrecords.findMany({
        where: { student: targetStudentId },
      }),
      prisma.results.findMany({
        where: { participants: { has: targetStudentId } },
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
