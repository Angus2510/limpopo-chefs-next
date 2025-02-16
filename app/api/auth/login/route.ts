//app/api/auth/login
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";
import Cookies from "js-cookie";

// app/api/auth/login/route.ts
export async function POST(request: Request) {
  const { identifier, password } = await request.json();

  try {
    // Your existing user lookup logic
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
        // Create JWT token
        const token = jwt.sign(
          {
            id: user.id,
            userType: type,
          },
          process.env["JWT_SECRET"]!,
          { expiresIn: "1h" }
        );

        // Store user data and token in cookies
        Cookies.set(
          "user",
          JSON.stringify({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            userType: type,
          }),
          { expires: 1 / 24 }
        ); // 1 hour expiration for cookie
        Cookies.set("accessToken", token, { expires: 1 / 24 }); // 1 hour expiration for token

        // IMPORTANT: Explicitly return both user and accessToken
        return NextResponse.json({
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            userType: type,
          },
          accessToken: token, // Make sure this is returned
        });
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
