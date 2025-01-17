import cookie from "cookie";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET;

export async function GET(req: Request) {
  try {
    const cookies = cookie.parse(req.headers.get("cookie") || "");
    const token = cookies.accessToken; // Match the cookie name

    if (!token) {
      return NextResponse.json({ message: "No token found" }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, SECRET_KEY);

    return NextResponse.json({ user: decoded.UserInfo }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Session error:", error.message);
    } else {
      console.error("Session error:", error);
    }
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
