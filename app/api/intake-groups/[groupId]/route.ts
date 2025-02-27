import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  // Fix: Access groupId directly from params without assigning to variable
  if (!params.groupId) {
    return NextResponse.json(
      { error: "Group ID is required" },
      { status: 400 }
    );
  }

  try {
    const intakeGroup = await prisma.intakegroups.findUnique({
      where: {
        id: params.groupId, // Use params.groupId directly here
      },
    });

    if (!intakeGroup) {
      return NextResponse.json(
        { error: "Intake group not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(intakeGroup);
  } catch (error) {
    console.error("Error fetching intake group:", error);
    return NextResponse.json(
      { error: "Failed to fetch intake group" },
      { status: 500 }
    );
  }
}
