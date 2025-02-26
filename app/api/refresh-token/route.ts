import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";

interface TokenPayload {
  id: string;
  userType: string;
  exp: number;
}

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(
      token,
      process.env["JWT_SECRET"]!
    ) as TokenPayload;

    // Get complete user data based on token
    let user;
    try {
      switch (decoded.userType) {
        case "Staff":
          user = await prisma.staffs.findUnique({
            where: { id: decoded.id },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
              staffNumber: true,
              role: true,
            },
          });
          break;
        case "Student":
          user = await prisma.students.findUnique({
            where: { id: decoded.id },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
              studentNumber: true,
            },
          });
          break;
        case "Guardian":
          user = await prisma.guardians.findUnique({
            where: { id: decoded.id },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          });
          break;
        default:
          return NextResponse.json(
            { error: "Invalid user type" },
            { status: 400 }
          );
      }

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    } catch (dbError) {
      console.error("Database error fetching user:", dbError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Token is still valid, refresh it with a new expiration
    const newToken = jwt.sign(
      {
        id: decoded.id,
        userType: decoded.userType,
      },
      process.env["JWT_SECRET"]!,
      { expiresIn: "10m" } // 10 minutes
    );

    // Set the new token in cookies
    cookieStore.set("accessToken", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60, // 10 minutes
      path: "/",
    });

    // Set last activity timestamp (removed duplicate call)
    cookieStore.set("lastActivity", Date.now().toString());

    return NextResponse.json({
      accessToken: newToken,
      user: {
        ...user,
        userType: decoded.userType,
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
