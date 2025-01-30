import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import prisma from "@/lib/db";
import type { TokenPayload } from "@/store/authStore";

export async function GET() {
  console.log("Route hit");
  try {
    const token = (await cookies()).get("accessToken")?.value;
    console.log("Token:", token);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwtDecode<TokenPayload>(token);

    if (decoded.exp < Date.now() / 1000) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }

    if (decoded.userType !== "Student") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const student = await prisma.students.findUnique({
      where: { id: decoded.id },
      include: { profile: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

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

    return NextResponse.json({
      student,
      wellnessRecords,
      results,
      learningMaterials,
      events,
      finances,
      documents,
    });
  } catch (error) {
    console.error("Error fetching student data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
