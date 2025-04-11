import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email/Mobile and password are required" },
        { status: 400 }
      );
    }

    const userTypes = [
      { model: prisma.staffs, type: "Staff" },
      { model: prisma.students, type: "Student" },
      { model: prisma.guardians, type: "Guardian" },
    ];

    for (const { model, type } of userTypes) {
      let user;

      if (type === "Guardian") {
        // Guardian specific query with student data
        user = await prisma.guardians.findFirst({
          where: {
            OR: [{ email: identifier }, { mobileNumber: identifier }],
          },
        });

        if (user?.password && bcrypt.compareSync(password, user.password)) {
          // Get the linked student using studentId
          const student = await prisma.students.findUnique({
            where: {
              id: user.studentId,
            },
          });

          if (!student) {
            return NextResponse.json(
              { error: "No student linked to this guardian account" },
              { status: 403 }
            );
          }

          if (!student.active) {
            return NextResponse.json(
              {
                error: "Student account disabled",
                reason:
                  student.inactiveReason ||
                  "The linked student account has been disabled",
                accountDisabled: true,
              },
              { status: 403 }
            );
          }

          // Create guardian token
          const token = jwt.sign(
            {
              id: user.id,
              userType: "Guardian",
              linkedStudentId: student.id,
              studentName: `${student.profile.firstName} ${student.profile.lastName}`,
              viewingAs: "Guardian",
            },
            process.env.JWT_SECRET!,
            { expiresIn: "2h" }
          );

          // Create guardian user data
          const userData = {
            id: user.id,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            userType: "Guardian",
            linkedStudentId: student.id,
            studentName: `${student.profile.firstName} ${student.profile.lastName}`,
            viewingAs: "Guardian",
          };

          const response = NextResponse.json({
            user: userData,
            accessToken: token,
          });

          response.cookies.set({
            name: "accessToken",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 2,
          });

          response.cookies.set({
            name: "user",
            value: JSON.stringify(userData),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 2,
          });

          return response;
        }
      } else {
        // Existing staff/student logic remains unchanged
        user = await model.findFirst({
          where: {
            OR: [{ email: identifier }, { username: identifier }],
          },
        });

        if (user?.password && bcrypt.compareSync(password, user.password)) {
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

          const token = jwt.sign(
            {
              id: user.id,
              userType: type,
              ...(type === "Student" && { active: user.active }),
            },
            process.env.JWT_SECRET!,
            { expiresIn: "2h" }
          );

          const userData = {
            id: user.id,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            userType: type,
            ...(type === "Student" && {
              active: user.active,
              inactiveReason: user.inactiveReason,
            }),
          };

          const response = NextResponse.json({
            user: userData,
            accessToken: token,
          });

          response.cookies.set({
            name: "accessToken",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 2,
          });

          response.cookies.set({
            name: "user",
            value: JSON.stringify(userData),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 2,
          });

          return response;
        }
      }
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
