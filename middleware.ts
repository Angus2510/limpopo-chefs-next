import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import { validateAssignmentPassword } from "@/lib/actions/assignments/validateAssignmentPassword";

interface DecodedToken {
  id: string | number;
  userType: string;
  exp: number;
  active?: boolean;
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const currentPath = request.nextUrl.pathname;

  // Skip middleware for API routes and the account-disabled page first
  if (currentPath.startsWith("/api/") || currentPath === "/account-disabled") {
    return NextResponse.next();
  }

  // Handle assignment password validation for specific assignment routes
  if (
    currentPath.startsWith("/student/assignments/") &&
    !currentPath.endsWith("/assignments")
  ) {
    const assignmentId = currentPath.split("/").pop();
    const assignmentPassword = request.cookies.get(
      "assignment_password"
    )?.value;

    if (!assignmentPassword) {
      console.log(
        "No assignment password found, redirecting to assignments page"
      );
      return NextResponse.redirect(
        new URL("/student/assignments", request.url)
      );
    }

    // Let the page component handle password validation
    return NextResponse.next();
  }

  // Define protected routes
  const protectedRoutes = ["/dashboard", "/student", "/staff", "/guardian"];

  // Debug logs
  console.log("Middleware Check:", {
    path: currentPath,
    hasToken: !!token,
  });

  const isProtectedRoute = protectedRoutes.some((route) =>
    currentPath.startsWith(route)
  );

  if (isProtectedRoute) {
    if (!token) {
      console.log("No token found, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      console.log("Decoded token:", {
        userType: decoded.userType,
        expiration: new Date(decoded.exp * 1000),
      });

      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        console.log("Token expired");
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("accessToken");
        return response;
      }

      const userType = decoded.userType;

      // Check if student account is disabled
      if (userType === "Student" && decoded.active === false) {
        console.log("Disabled student account attempting access");
        return NextResponse.redirect(new URL("/account-disabled", request.url));
      }

      const userPath = `/${userType.toLowerCase()}`;

      console.log("Access Check:", {
        currentPath,
        userType,
        userPath,
      });

      if (currentPath.startsWith(userPath)) {
        return NextResponse.next();
      }

      if (currentPath === "/dashboard") {
        return NextResponse.redirect(
          new URL(`${userPath}/dashboard`, request.url)
        );
      }

      if (protectedRoutes.some((route) => currentPath.startsWith(route))) {
        console.log("Unauthorized access attempt");
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      return NextResponse.next();
    } catch (error) {
      console.error("Token validation error:", error);
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("accessToken");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/student/:path*",
    "/staff/:path*",
    "/guardian/:path*",
    "/admin/assignment/mark/:path*",
    "/student/assignments/:id*",
    "/admin/results/capture/:path*",
  ],
};
