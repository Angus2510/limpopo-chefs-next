"use server";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import prisma from "@/lib/db";
import useAuthStore from "@/store/authStore";
import { fetchStudentWelRecords } from "./fetchStudentWelRecords";
import { fetchStudentResults } from "./fetchStudentResults";
import { fetchStudentFinances } from "./fetchStudentFinances";
import { fetchStudentDocuments } from "./fetchStudentDocuments";

export async function fetchStudentData(studentId?: string) {
  try {
    const tokenFromStore = useAuthStore.getState().getToken();
    const tokenFromCookies = (await cookies()).get("accessToken")?.value;
    const token = tokenFromStore || tokenFromCookies;

    console.log("Token from auth store:", tokenFromStore);
    console.log("Token from cookies:", tokenFromCookies);

    // Make token optional for view operations if a specific studentId is provided
    let targetStudentId = studentId;
    let decodedToken = null;

    if (token) {
      try {
        // Safely decode the token
        decodedToken = token ? jwtDecode(token) : null;

        // CRITICAL FIX: Check if decoded token actually contains expected fields
        if (
          decodedToken &&
          typeof decodedToken === "object" &&
          "exp" in decodedToken &&
          "userType" in decodedToken
        ) {
          if (decodedToken.exp >= Date.now() / 1000) {
            // Token is valid
            if (decodedToken.userType === "Student") {
              // Students can only view their own data
              targetStudentId = decodedToken.id || targetStudentId;
            }
            // Staff can view any student's data
          }
        } else {
          console.warn("Invalid token format:", decodedToken);
        }
      } catch (tokenError) {
        console.warn("Token validation error:", tokenError);
        // Continue with the provided studentId
      }
    } else if (!studentId) {
      // No token and no studentId provided
      throw new Error("Authentication required to access student data");
    }

    if (!targetStudentId) {
      throw new Error("Student ID is required");
    }

    console.log("Fetching data for student ID:", targetStudentId);

    // Get student basic data
    const student = await prisma.students.findUnique({
      where: { id: targetStudentId },
      include: {
        profile: {
          include: {
            address: true,
          },
        },
      },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    // CRITICAL FIX: Explicitly extract and log email address to debug
    const emailAddress = student.email || "No email available";
    console.log("Found student:", student.id, "Email:", emailAddress);

    // Now get the guardians data by their IDs
    let guardians = [];
    try {
      // First log the raw guardians data to inspect it
      console.log("Raw guardians data:", student.guardians);

      // Ensure guardians data is an array and remove duplicates
      const guardianIds = Array.from(
        new Set(
          Array.isArray(student.guardians)
            ? student.guardians
            : typeof student.guardians === "object" &&
              student.guardians !== null
            ? Object.values(student.guardians)
            : []
        )
      ).filter(Boolean);

      console.log("Processed guardian IDs:", guardianIds);

      if (guardianIds.length > 0) {
        try {
          guardians = await prisma.guardians.findMany({
            where: {
              id: { in: guardianIds },
            },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              relationship: true,
            },
          });
          console.log("Successfully retrieved guardians:", guardians);
        } catch (dbError) {
          console.warn("Database error fetching guardians:", dbError);
          guardians = [];
        }
      } else {
        console.log("No guardian IDs to fetch");
      }
    } catch (error) {
      console.warn("Error in guardian processing:", error);
      guardians = [];
    }

    // CRITICAL FIX: Better processing for data arrays
    const campusArray = Array.isArray(student.campus)
      ? student.campus
      : typeof student.campus === "string"
      ? [student.campus]
      : [];

    const intakeGroupArray = Array.isArray(student.intakeGroup)
      ? student.intakeGroup
      : typeof student.intakeGroup === "string"
      ? [student.intakeGroup]
      : [];

    const qualificationArray = Array.isArray(student.qualification)
      ? student.qualification
      : typeof student.qualification === "string"
      ? [student.qualification]
      : [];

    console.log("Campus Array:", campusArray);
    console.log("IntakeGroup Array:", intakeGroupArray);

    // CRITICAL FIX: Direct database queries with explicit logging
    let campuses = [];
    try {
      // Check if campus array has items before querying
      if (campusArray.length > 0) {
        campuses = await prisma.campus.findMany({
          where: { id: { in: campusArray } },
        });
        console.log(`Retrieved ${campuses.length} campuses:`, campuses);
      } else {
        console.log("No campus IDs to fetch");
      }
    } catch (error) {
      console.warn("Error fetching campuses:", error);
    }

    let intakeGroups = [];
    try {
      // Check if intake group array has items before querying
      if (intakeGroupArray.length > 0) {
        intakeGroups = await prisma.intakegroups.findMany({
          where: { id: { in: intakeGroupArray } },
        });
        console.log(
          `Retrieved ${intakeGroups.length} intake groups:`,
          intakeGroups
        );
      } else {
        console.log("No intake group IDs to fetch");
      }
    } catch (error) {
      console.warn("Error fetching intake groups:", error);
    }

    let qualifications = [];
    try {
      // Check if qualification array has items before querying
      if (qualificationArray.length > 0) {
        qualifications = await prisma.qualifications.findMany({
          where: { id: { in: qualificationArray } },
        });
      }
    } catch (error) {
      console.warn("Error fetching qualifications:", error);
    }

    // CRITICAL FIX: Improved map creation with better debugging
    const campusMap = {};
    campuses.forEach((campus) => {
      if (campus && campus.id) {
        // Based on your schema, campus only has id, v, and title properties
        campusMap[campus.id] = campus.title || "Unknown Campus";
        console.log(`Mapped campus ${campus.id} to "${campus.title}"`);
      }
    });

    const intakeGroupMap = {};
    intakeGroups.forEach((group) => {
      if (group && group.id) {
        // Based on your schema, intakegroups has id, v, campus, outcome, and title
        intakeGroupMap[group.id] = group.title || "Unknown Intake Group";
        console.log(`Mapped intake group ${group.id} to "${group.title}"`);
      }
    });

    const qualificationMap = {};
    qualifications.forEach((qual) => {
      if (qual && qual.id) {
        qualificationMap[qual.id] = qual.title || "Unknown Qualification";
      }
    });

    // CRITICAL FIX: Create a complete student object with verbose logging
    const campusTitles = campusArray.map((id) => campusMap[id] || id);
    const intakeGroupTitles = intakeGroupArray.map(
      (id) => intakeGroupMap[id] || id
    );
    const qualificationTitles = qualificationArray.map(
      (id) => qualificationMap[id] || id
    );

    console.log("Campus titles array:", campusTitles);
    console.log("Intake group titles array:", intakeGroupTitles);

    const completeStudent = {
      ...student,
      // Explicitly add email to the root level
      email: emailAddress,

      // Explicitly build titles with fallbacks
      campusTitle:
        campusTitles.length > 0
          ? campusTitles.join(", ")
          : "No campus assigned",

      intakeGroupTitle:
        intakeGroupTitles.length > 0
          ? intakeGroupTitles.join(", ")
          : "No intake group assigned",

      qualificationTitle:
        qualificationTitles.length > 0
          ? qualificationTitles.join(", ")
          : "No qualification assigned",

      // Also keep the original details for reference
      campusDetails: campuses,
      intakeGroupDetails: intakeGroups,
      qualificationDetails: qualifications,
    };

    console.log("Final mapped titles:", {
      campus: completeStudent.campusTitle,
      intakeGroup: completeStudent.intakeGroupTitle,
      email: completeStudent.email,
    });

    // Rest of the function remains the same for fetching additional data
    let wellnessRecords = [],
      results = [],
      finances = { collectedFees: [], payableFees: [] },
      documents = [];

    try {
      wellnessRecords = await fetchStudentWelRecords(targetStudentId).catch(
        () => []
      );
    } catch (error) {
      console.warn("Error fetching wellness records:", error);
    }

    try {
      results = await fetchStudentResults(targetStudentId).catch(() => []);
    } catch (error) {
      console.warn("Error fetching results:", error);
    }

    try {
      finances = await fetchStudentFinances(targetStudentId).catch(() => ({
        collectedFees: [],
        payableFees: [],
      }));
    } catch (error) {
      console.warn("Error fetching finances:", error);
    }

    try {
      documents = await fetchStudentDocuments(targetStudentId).catch(() => []);
    } catch (error) {
      console.warn("Error fetching documents:", error);
    }

    // Safely fetch events with robust error handling
    let events = [];
    try {
      events = await prisma.events
        .findMany({
          where: {
            OR: [
              { assignedTo: { has: targetStudentId } },
              { intakeGroup: { hasSome: intakeGroupArray } },
            ],
          },
        })
        .catch(() => []);
    } catch (error) {
      console.warn("Error fetching events:", error);
    }

    // Safely fetch learning materials
    let learningMaterials = [];
    try {
      // Based on your schema, the model is named "learningmaterials" (lowercase)
      learningMaterials = await prisma.learningmaterials
        .findMany({
          where: {
            intakeGroup: { hasSome: intakeGroupArray },
          },
        })
        .catch(() => []);
    } catch (error) {
      console.warn("Error fetching learning materials:", error);
    }

    return {
      student: completeStudent,
      guardians: guardians,
      wellnessRecords: wellnessRecords,
      results: results,
      finances: finances,
      documents: documents,
      events: events,
      learningMaterials: learningMaterials,
    };
  } catch (error) {
    console.error("Error fetching student data:", error);
    throw error;
  }
}
