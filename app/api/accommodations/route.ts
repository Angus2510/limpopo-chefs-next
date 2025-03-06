import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET all accommodations
export async function GET() {
  try {
    const accommodations = await prisma.accommodations.findMany();
    return NextResponse.json(accommodations);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch accommodations" },
      { status: 500 }
    );
  }
}

// POST new accommodation
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const accommodation = await prisma.accommodations.create({
      data: {
        roomNumber: data.roomNumber,
        address: data.address,
        costPerBed: Number(data.costPerBed),
        numberOfOccupants: Number(data.numberOfOccupants),
        occupantType: data.occupantType,
        occupants: [], // Initialize with empty array
        roomType: data.roomType,
        v: 0, // Required by schema
      },
    });

    return NextResponse.json(accommodation, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create accommodation" },
      { status: 500 }
    );
  }
}
