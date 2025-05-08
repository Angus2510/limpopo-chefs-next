import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const groupId = params.groupId;

    // Get the group info only
    const group = await prisma.intakegroups.findUnique({
      where: {
        id: groupId,
      },
      select: {
        id: true,
        title: true,
        campus: true,
        status: true,
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error("Error fetching group:", error);
    return NextResponse.json(
      { error: "Failed to fetch group" },
      { status: 500 }
    );
  }
}
