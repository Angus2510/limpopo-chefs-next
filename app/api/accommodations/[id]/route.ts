import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET single accommodation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accommodation = await prisma.accommodations.findUnique({
      where: { id: params.id },
    });

    if (!accommodation) {
      return NextResponse.json(
        { error: "Accommodation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(accommodation);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch accommodation" },
      { status: 500 }
    );
  }
}

// PUT update accommodation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    const accommodation = await prisma.accommodations.update({
      where: { id: params.id },
      data: {
        roomNumber: data.roomNumber,
        address: data.address,
        costPerBed: Number(data.costPerBed),
        numberOfOccupants: Number(data.numberOfOccupants),
        occupantType: data.occupantType,
        roomType: data.roomType,
      },
    });

    return NextResponse.json(accommodation);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update accommodation" },
      { status: 500 }
    );
  }
}

// DELETE accommodation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.accommodations.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete accommodation" },
      { status: 500 }
    );
  }
}
