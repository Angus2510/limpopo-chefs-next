"use server";

import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import * as jose from "jose";
import { cookies, headers } from "next/headers";
import { randomBytes } from "crypto";

const secretKey = new TextEncoder().encode(
  process.env.SECRET_KEY || "your-secret-key"
);
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

type UserType = "Staff" | "Student" | "Guardian";

interface LoginParams {
  identifier: string;
  password: string;
  userAgent: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  avatar?: string;
  userType: UserType;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  user: Omit<User, "password">;
}

async function generateAccessToken(
  sessionId: string,
  userType: UserType
): Promise<string> {
  if (!sessionId || !userType) {
    throw new Error("SessionId and userType are required for token generation");
  }

  const payload = {
    sub: sessionId,
    userType: userType,
    type: "access",
  };

  try {
    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime(ACCESS_TOKEN_EXPIRY)
      .sign(secretKey);

    console.log("Access token created successfully");
    return token;
  } catch (error) {
    console.error("Error generating access token:", error);
    throw error;
  }
}

async function generateRefreshToken(sessionId: string): Promise<string> {
  if (!sessionId) {
    console.error("Missing sessionId for refresh token");
    throw new Error("SessionId is required for refresh token generation");
  }

  const payload = {
    sub: sessionId,
    type: "refresh",
  };

  try {
    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime(REFRESH_TOKEN_EXPIRY)
      .sign(secretKey);

    console.log("Refresh token created successfully");
    return token;
  } catch (error) {
    console.error("Error generating refresh token:", error);
    throw error;
  }
}

function generateUniqueToken(): string {
  return randomBytes(64).toString("hex");
}

export async function login({
  identifier,
  password,
  userAgent,
}: LoginParams): Promise<LoginResponse> {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "0.0.0.0";

    let user: User | null = null;
    let userType: UserType | undefined = undefined;

    // Check Staff
    const staff = await prisma.staffs.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
      include: {
        profile: true,
      },
    });

    console.log("Staff lookup result:", staff ? "found" : "not found");

    if (
      staff &&
      staff.password &&
      bcrypt.compareSync(password, staff.password)
    ) {
      user = {
        id: Number(staff.id),
        firstName: staff.profile.firstName!,
        lastName: staff.profile.lastName!,
        avatar: staff.profile.avatar || undefined,
        password: staff.password,
        userType: "Staff",
      };
      userType = "Staff";
    } else {
      // Check Student
      const student = await prisma.students.findFirst({
        where: {
          OR: [{ email: identifier }, { username: identifier }],
        },
        include: {
          profile: true,
        },
      });

      console.log("Student lookup result:", student ? "found" : "not found");

      if (
        student &&
        student.password &&
        bcrypt.compareSync(password, student.password)
      ) {
        user = {
          id: Number(student.id),
          firstName: student.profile.firstName,
          lastName: student.profile.lastName,
          avatar: student.profile.avatar || undefined,
          password: student.password,
          userType: "Student",
        };
        userType = "Student";
      } else {
        // Check Guardian
        const guardian = await prisma.guardians.findFirst({
          where: {
            OR: [{ email: identifier }],
          },
        });

        console.log(
          "Guardian lookup result:",
          guardian ? "found" : "not found"
        );

        if (guardian && bcrypt.compareSync(password, guardian.password)) {
          user = {
            id: Number(guardian.id),
            firstName: guardian.firstName,
            lastName: guardian.lastName,
            avatar: undefined,
            password: guardian.password,
            userType: "Guardian",
          };
          userType = "Guardian";
        }
      }
    }

    if (!user || !userType) {
      console.log("No user found or invalid credentials");
      throw new Error("Invalid identifier or password");
    }

    console.log("User authenticated successfully:", userType);

    try {
      const sessionId = generateUniqueToken();

      const accessToken = await generateAccessToken(sessionId, userType);
      const refreshToken = await generateRefreshToken(sessionId);

      console.log("Tokens generated successfully");

      let roles: string[] = [];
      let permissions: string[] = [];

      if (userType === "Staff") {
        const fetchedRoles = await fetchUserRoles(user.id, userType);
        roles = fetchedRoles.roles;
        permissions = fetchedRoles.permissions;
      }

      // Create session entry
      await prisma.session.create({
        data: {
          userId: user.id,
          userType,
          token: sessionId,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          userAgent: userAgent || "",
          ip,
          roles,
          permissions,
        },
      });

      console.log("Session created successfully");

      // Set cookies
      const cookieStore = cookies();

      cookieStore.set("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60,
      });

      cookieStore.set("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      return {
        accessToken,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          userType,
        },
      };
    } catch (tokenError) {
      console.error("Token generation error:", tokenError);
      throw tokenError;
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}
