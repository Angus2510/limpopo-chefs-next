import bcrypt from "bcryptjs";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

import clientPromise from "@/lib/mongodb"; // MongoDB connection

export async function POST(request: Request) {
  const { identifier, password } = await request.json(); // Changed email/username to identifier

  try {
    // Connect to the database
    const client = await clientPromise;
    const db = client.db();
    const studentsCollection = db.collection("students");
    const staffCollection = db.collection("staffs");

    // Find user by email or username
    let user = await studentsCollection.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      user = await staffCollection.findOne({
        $or: [{ email: identifier }, { username: identifier }],
      });
    }

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check password validity
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        UserInfo: {
          id: user._id,
          email: user.email,
          username: user.username,
          userType: user.userType.toLowerCase(),
          role: user.role || "unknown",
        },
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "8h" }
    );

    // Set cookies
    const accessTokenCookie = cookie.serialize("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8, // 8 hours
      sameSite: "lax",
      path: "/",
    });

    // Return the token and set cookies
    const headers = new Headers();
    headers.append("Set-Cookie", accessTokenCookie);

    return NextResponse.json(
      { message: "Login successful", token },
      { status: 200, headers }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
