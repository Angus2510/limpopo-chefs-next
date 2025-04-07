"use client";
import React, { useState, useEffect } from "react";
import AttendanceCalendar from "@/components/attendance/AttendanceCalendar";
import { useAuth } from "@/context/auth-context";
import { ContentLayout } from "@/components/layout/content-layout";
import { fetchStudentWelRecords } from "@/lib/actions/student/fetchStudentWelRecords";

const AttendancePage = () => {
  const { user, isAuthenticated } = useAuth();
  const studentId = user?.id;
  const [welRecords, setWelRecords] = useState([]);

  useEffect(() => {
    const loadWelRecords = async () => {
      if (studentId) {
        try {
          const records = await fetchStudentWelRecords(studentId);
          setWelRecords(records);
        } catch (error) {
          console.error("Error fetching WEL records:", error);
        }
      }
    };

    loadWelRecords();
  }, [studentId]);

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
        <AttendanceCalendar studentId={studentId} welRecords={welRecords} />
      </div>
    </ContentLayout>
  );
};

export default AttendancePage;
