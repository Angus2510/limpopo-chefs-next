"use client";
import React from "react";
import AttendanceCalendar from "@/components/attendance/AttendanceCalendar";
import { useAuth } from "@/context/auth-context";
import { ContentLayout } from "@/components/layout/content-layout";

const AttendancePage = () => {
  const { user, isAuthenticated } = useAuth();
  const studentId = user?.id;

  if (!isAuthenticated() || !studentId) {
    return (
      <div className="p-4">
        <p>Please login to view your attendance</p>
      </div>
    );
  }

  return (
    <ContentLayout title="Attendance History">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">My Attendance History</h1>
        <AttendanceCalendar studentId={studentId} />
      </div>
    </ContentLayout>
  );
};

export default AttendancePage;
