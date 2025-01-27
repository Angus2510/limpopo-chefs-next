import { NextResponse } from "next/server";
import prisma from "@/lib/db"; // Ensure your Prisma setup is correct
import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";

// GET request handler to fetch all intake groups

// POST request handler to create a new intake group
export async function POST(req: Request) {
  try {
    const { title } = await req.json();

    // Ensure all required fields are present
    if (!title) {
      return NextResponse.json(
        { message: "All fields (title are required." },
        { status: 400 }
      );
    }

    // Create the intake group in the database
    const intakeGroup = await prisma.intakegroups.create({
      data: {
        title: String(title),

        v: 1, // Assuming a default value for 'v'
      },
    });

    // Return the created intake group as a JSON response
    return NextResponse.json(intakeGroup, { status: 201 });
  } catch (error) {
    console.error("Error creating intake group:", error);
    return NextResponse.json(
      { message: "Error creating intake group." },
      { status: 500 }
    );
  }
}
