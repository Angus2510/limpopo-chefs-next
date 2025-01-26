"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";

export default function ProtectedStudentDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, getToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Comprehensive authentication verification process
    const checkAuthentication = async () => {
      console.group("Student Dashboard Authentication Check");

      // Log initial authentication state
      console.log("Initial Authentication Status:", isAuthenticated());
      console.log("Current User:", user);

      // Retrieve authentication token
      const token = getToken();
      console.log("Token Present:", !!token);

      // Additional token validation if token exists
      if (token) {
        try {
          // Server-side token validation
          const response = await fetch("/api/validate-token", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              // Updated to use userType instead of role
              "X-User-Type": "student",
            },
          });

          if (!response.ok) {
            console.log("Server-side token validation failed");
            throw new Error("Invalid token or insufficient permissions");
          }

          console.log("Server-side token validation successful");
        } catch (error) {
          console.error("Token validation error:", error);
          // Force logout if token is invalid or permissions are insufficient
          useAuthStore.getState().logout();
          router.push("/login");
          return;
        }
      }

      // Final authentication and type check
      if (!isAuthenticated()) {
        console.log("Redirecting to login");
        router.push("/login");
      } else {
        // Optional: Additional type-specific check
        const userType = user?.userType;
        if (userType !== "student") {
          console.log("Unauthorized user type access attempt");
          router.push("/unauthorized");
          return;
        }
      }

      setIsLoading(false);
      console.groupEnd();
    };

    checkAuthentication();
  }, [isAuthenticated, router]);

  // Loading state to prevent content flickering
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-xl">
          Loading Student Dashboard...
        </div>
      </div>
    );
  }

  // Prevent rendering if not authenticated
  if (!isAuthenticated()) {
    return null;
  }

  // Render student dashboard content
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

      {/* Student-specific dashboard components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <p>Name: {user?.name}</p>
          <p>Email: {user?.email}</p>
          <p>User Type: {user?.userType}</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Courses</h2>
          {/* Placeholder for course information */}
          <p>Enrolled Courses: Loading...</p>
        </div>

        {/* Add more dashboard widgets/sections as needed */}
      </div>
    </div>
  );
}
