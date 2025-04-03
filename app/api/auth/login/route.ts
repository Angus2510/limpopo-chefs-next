import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  const { identifier, password } = await request.json();

  try {
    const userTypes = [
      { model: prisma.staffs, type: "Staff" },
      { model: prisma.students, type: "Student" },
      { model: prisma.guardians, type: "Guardian" },
    ];

    for (const { model, type } of userTypes) {
      const user = await model.findFirst({
        where: {
          OR: [{ email: identifier }, { username: identifier }],
        },
      });

      if (user && bcrypt.compareSync(password, user.password)) {
        // Check if student account is disabled
        if (type === "Student" && user.active === false) {
          return NextResponse.json(
            {
              error: "Account disabled",
              reason: user.inactiveReason || "Your account has been disabled",
              accountDisabled: true,
            },
            { status: 403 }
          );
        }

        // Create JWT token
        const token = jwt.sign(
          {
            id: user.id,
            userType: type,
            // Add active status for students to the token
            ...(type === "Student" && { active: user.active }),
          },
          process.env["JWT_SECRET"]!,
          { expiresIn: "2h" }
        );

        // Create user data object
        const userData = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: type,
          // Include active status and reason for students
          ...(type === "Student" && {
            active: user.active,
            inactiveReason: user.inactiveReason,
          }),
        };

        // Create response
        const response = NextResponse.json({
          user: userData,
          accessToken: token,
        });

        // Set HTTP-only cookies
        response.cookies.set({
          name: "accessToken",
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 2, // 1 hour
        });

        response.cookies.set({
          name: "user",
          value: JSON.stringify(userData),
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 2, // 1 hour
        });

        return response;
      }
    }

    // If no user found
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
