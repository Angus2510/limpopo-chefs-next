// File: app/api/materials/[id]/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/db"; // Adjust this path as necessary

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // Await the params before destructuring
  const { id } = await context.params;

  try {
    // Attempt to delete the material from the database.
    const deletedMaterial = await prisma.learningmaterials.delete({
      where: { id },
    });

    // Return a success response.
    return NextResponse.json(
      { message: "Material deleted successfully", deletedMaterial },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting material:", error);

    // If the material isn't found or another error occurs, return an error response.
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
//PUT handler: Updates a material record with new data.
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // Await the dynamic route parameters before using them
  const { id } = await context.params;

  try {
    // Parse the request body as JSON
    const body = await request.json();

    // Destructure and validate fields from the request body as needed.
    // For example, we expect title, description, and intakeGroups.
    const { title, description, intakeGroups } = body;

    // Update the material record in the database.
    const updatedMaterial = await prisma.learningmaterials.update({
      where: { id },
      data: {
        title, // Update title if provided
        description, // Update description if provided
        intakeGroups, // Update intakeGroups as per your schema
      },
    });

    return NextResponse.json(
      { message: "Material updated successfully", updatedMaterial },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating material:", error);

    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
