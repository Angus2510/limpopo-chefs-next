import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db"; // Ensure this path matches your actual Prisma setup

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing file ID" }, { status: 400 });
    }

    // Delete file from the database
    await prisma.learningmaterials.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "File deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
