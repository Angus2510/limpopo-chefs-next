"use server";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import prisma from "@/lib/db";
import useAuthStore from "@/store/authStore"; // Adjust this import according to your project structure

export async function fetchStudentData() {
  try {
    // Retrieve token from both cookies and the auth store
    const tokenFromStore = useAuthStore.getState().getToken(); // From auth store
    const tokenFromCookies = (await cookies()).get("accessToken")?.value; // From cookies

    console.log("Token from auth store:", tokenFromStore); // Log token from store
    console.log("Token from cookies:", tokenFromCookies); // Log token from cookies

    const token = tokenFromStore || tokenFromCookies; // Prefer token from store if available

    if (!token) {
      throw new Error("No token found");
    }

    // Decode and validate the token
    const decoded = jwtDecode(token);

    if (decoded.exp < Date.now() / 1000) {
      throw new Error("Token expired");
    }

    if (decoded.userType !== "Student") {
      throw new Error("Unauthorized access");
    }

    // Query the database directly using Prisma
    const student = await prisma.students.findUnique({
      where: { id: decoded.id },
      include: { profile: true }, // Adjust as necessary
    });

    if (!student) {
      throw new Error("Student not found");
    }

    // Fetch related data from the database
    const [
      wellnessRecords,
      results,
      learningMaterials,
      events,
      finances,
      documents,
    ] = await Promise.all([
      prisma.studentwelrecords.findMany({
        where: { student: decoded.id },
      }),
      prisma.results.findMany({
        where: {
          participants: {
            has: decoded.id,
          },
        },
      }),
      prisma.learningmaterials.findMany({
        where: {
          intakeGroup: {
            hasSome: student.intakeGroup,
          },
        },
      }),
      prisma.events.findMany({
        where: {
          assignedTo: {
            has: decoded.id,
          },
        },
      }),
      prisma.finances.findFirst({
        where: {
          student: decoded.id,
        },
      }),
      prisma.generaldocuments.findMany({
        where: {
          student: decoded.id,
        },
      }),
    ]);

    return {
      student,
      wellnessRecords,
      results,
      learningMaterials,
      events,
      finances,
      documents,
    };
  } catch (error) {
    console.error("Error fetching student data:", error.message);
    throw error; // Rethrow to be handled by calling code
  }
}
