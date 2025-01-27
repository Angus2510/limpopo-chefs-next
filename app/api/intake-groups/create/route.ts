import { NextResponse } from "next/server";
import prisma from "@/lib/db"; // Assuming Prisma setup is correct

// POST request handler to create a new intake group
export async function POST(req: Request) {
  try {
    // Parse the incoming request body
    const { title, campus, outcome } = await req.json();

    // Log the received data for debugging
    console.log("Received data:", { title, campus, outcome });

    // Ensure no null or undefined values are passed
    if (!title || !campus || !outcome) {
      console.error("Error: Missing required fields:", {
        title,
        campus,
        outcome,
      });
      return NextResponse.json(
        { message: "All fields (title, campus, outcome) are required." },
        { status: 400 }
      );
    }

    // Create the intake group in the database
    const intakeGroup = await prisma.intakegroups.create({
      data: {
        title: String(title),
        campus: Array.isArray(campus) ? campus.map(String) : [String(campus)], // Ensure campus is an array of strings
        outcome: Array.isArray(outcome)
          ? outcome.map(String)
          : [String(outcome)], // Ensure outcome is an array of strings
        v: 1, // Assuming a default value for 'v'
      },
    });

    // Log the intake group result to check if it's correctly created
    console.log("Created intake group:", intakeGroup);

    // If intake group creation fails, log and handle the error
    if (!intakeGroup) {
      console.error("Failed to create intake group: Prisma returned null");
      return NextResponse.json(
        { message: "Failed to create intake group." },
        { status: 500 }
      );
    }

    // Return the created intake group as a JSON response
    return NextResponse.json(intakeGroup, { status: 201 });
  } catch (error) {
    console.error("Error creating intake group:", error); // Detailed error logging

    // Return an error response if something went wrong
    return NextResponse.json(
      { message: "Error creating intake group." },
      { status: 500 }
    );
  }
}
