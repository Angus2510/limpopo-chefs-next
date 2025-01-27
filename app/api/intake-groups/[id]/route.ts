// app/api/intake-groups/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// PUT request handler to update an intake group
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { title } = await req.json();

    if (!title) {
      return NextResponse.json(
        { message: "Title is required." },
        { status: 400 }
      );
    }

    const updatedGroup = await prisma.intakegroups.update({
      where: { id: params.id },
      data: { title: String(title) },
    });

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error("Error updating intake group:", error);
    return NextResponse.json(
      { message: "Error updating intake group." },
      { status: 500 }
    );
  }
}

// DELETE request handler to delete an intake group
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.intakegroups.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Intake group deleted successfully." });
  } catch (error) {
    console.error("Error deleting intake group:", error);
    return NextResponse.json(
      { message: "Error deleting intake group." },
      { status: 500 }
    );
  }
}
