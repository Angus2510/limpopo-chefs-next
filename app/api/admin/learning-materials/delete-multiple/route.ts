import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db"; // Ensure the correct path to your Prisma setup

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid or missing file IDs" },
        { status: 400 }
      );
    }

    // Delete multiple files
    await prisma.learningmaterials.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json(
      { message: "Files deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting files:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
