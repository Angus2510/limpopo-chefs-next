import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: string | number;
  userType: string;
  exp: number;
  active?: boolean; // Added to handle student active status
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const currentPath = request.nextUrl.pathname;

  // Skip middleware for API routes and the account-disabled page
  if (currentPath.startsWith("/api/") || currentPath === "/account-disabled") {
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

// Update config to include the account-disabled route
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/student/:path*",
    "/staff/:path*",
    "/guardian/:path*",
    "/admin/assignment/mark/:path*",
  ],
};
