import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface UpdateRequestBody {
  campus: string[];
  outcome: string[];
  title: string;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body: UpdateRequestBody = await req.json();

    const updatedGroup = await prisma.intakegroups.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updatedGroup, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update intake group" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.intakegroups.delete({
      where: { id },
    });

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete intake group" },
      { status: 500 }
    );
  }
}
