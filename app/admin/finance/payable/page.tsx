"use client";

import { ContentLayout } from "@/components/layout/content-layout";
import { Card, CardContent } from "@/components/ui/card";
import * as React from "react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { SelectionForm } from "@/components/finance/SelectionFormFinance";
import { getStudentsByIntakeAndCampus } from "@/lib/actions/student/getStudentsByIntakeAndCampus";
import { getPayableData } from "@/lib/actions/finance/payableQuery";
import { getAllCampuses } from "@/lib/actions/campus/campuses";
import { toggleStudentPortal } from "@/lib/actions/student/toggleStudentPortal";
import type { Student } from "@/types/finance/types";
import { useToast } from "@/components/ui/use-toast";

// Helper functions
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (promise: Promise<any>, timeoutMs: number) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Request timed out")), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]);
};

const PayablePage = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [campusMap, setCampusMap] = useState<Map<string, string>>(new Map());

  // Fetch campuses on mount
  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const campuses = await getAllCampuses();
        const map = new Map(
          campuses.map((campus) => [campus.id, campus.title])
        );
        setCampusMap(map);
      } catch (error) {
        console.error("Error fetching campuses:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch campus information",
        });
      }
    };
    fetchCampuses();
  }, [toast]);

  const handleSelectionComplete = async (selection: {
    intakeGroupId: string[];
    campusId: string;
  }) => {
    if (!selection.intakeGroupId.length || !selection.campusId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both intake group and campus",
      });
      return;
    }

    setLoading(true);
    try {
      // Fetch students with retries
      let fetchedStudents;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          fetchedStudents = await fetchWithTimeout(
            getStudentsByIntakeAndCampus(
              selection.intakeGroupId,
              selection.campusId
            ),
            30000 // 30 second timeout
          );
          break;
        } catch (error) {
          if (attempt === 3) {
            throw new Error("Failed to fetch students after multiple attempts");
          }
          console.log(`Attempt ${attempt} failed, retrying...`);
          await delay(2000);
        }
      }

      if (!fetchedStudents?.length) {
        toast({
          variant: "warning",
          title: "No Students Found",
          description: "No students found for the selected criteria.",
        });
        setStudents([]);
        return;
      }

      // Fetch financial data with retries
      let financialData;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          financialData = await fetchWithTimeout(
            getPayableData({
              page: 1,
              per_page: 1000,
              sort: "admissionNumber.asc",
              campusTitles: [selection.campusId],
            }),
            30000
          );
          break;
        } catch (error) {
          console.error(
            `Financial data fetch attempt ${attempt} failed:`,
            error
          );
          if (attempt === 3) {
            console.warn("Using empty financial data after failed attempts");
            financialData = { students: [] };
          } else {
            await delay(2000);
          }
        }
      }

      // Process and combine data
      const financialMap = new Map(
        (financialData?.students || []).map((student) => [
          student.admissionNumber,
          {
            payableAmounts: student.payableAmounts || "0",
            payableDueDates: student.payableDueDates || "",
            profileBlocked: student.profileBlocked || "No",
          },
        ])
      );

      const transformedStudents = fetchedStudents.map((student) => {
        const financials = financialMap.get(student.admissionNumber);
        const campusTitle = campusMap.get(selection.campusId);

        return {
          id: student.id,
          firstName: student.name,
          lastName: student.surname,
          admissionNumber: student.admissionNumber,
          campuses: selection.campusId,
          campusTitle: campusTitle || "Unknown Campus",
          payableAmounts: financials?.payableAmounts || "0",
          payableDueDates: financials?.payableDueDates || "",
          profileBlocked:
            financials?.profileBlocked || (student.active ? "No" : "Yes"),
        };
      });

      const sortedStudents = transformedStudents.sort((a, b) => {
        const amountA = parseFloat(a.payableAmounts) || 0;
        const amountB = parseFloat(b.payableAmounts) || 0;
        return amountB - amountA;
      });

      setStudents(sortedStudents);
    } catch (error) {
      console.error("Error in handleSelectionComplete:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch data. Please try again.",
      });
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePortalAccess = async (
    studentId: string,
    enabled: boolean
  ) => {
    try {
      await toggleStudentPortal(studentId, enabled);
      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentId
            ? { ...student, profileBlocked: enabled ? "No" : "Yes" }
            : student
        )
      );
      toast({
        title: "Success",
        description: `Portal access ${enabled ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      console.error("Error toggling portal access:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to toggle portal access",
      });
    }
  };

  const handleAmountChange = async (studentId: string, newAmount: string) => {
    try {
      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentId
            ? { ...student, payableAmounts: newAmount }
            : student
        )
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update amount",
      });
    }
  };

  const handleDueDateChange = async (studentId: string, newDate: string) => {
    try {
      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentId
            ? { ...student, payableDueDates: newDate }
            : student
        )
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update due date",
      });
    }
  };

  return (
    <ContentLayout title="Student Finances">
      <Card className="rounded-lg border-none">
        <CardContent className="p-6">
          <div className="mb-6">
            <SelectionForm onSelectionComplete={handleSelectionComplete} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead>Amount Due</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Portal Access</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow
                    key={student.id}
                    className={
                      parseFloat(student.payableAmounts) > 0
                        ? "text-red-600"
                        : ""
                    }
                  >
                    <TableCell>{student.admissionNumber}</TableCell>
                    <TableCell>
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell>{student.campusTitle}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        defaultValue={student.payableAmounts}
                        onBlur={(e) =>
                          handleAmountChange(student.id, e.target.value)
                        }
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        defaultValue={
                          student.payableDueDates?.split("T")[0] || ""
                        }
                        onBlur={(e) =>
                          handleDueDateChange(student.id, e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={student.profileBlocked === "No"}
                        onCheckedChange={(checked) =>
                          handleTogglePortalAccess(student.id, checked)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </ContentLayout>
  );
};

export default PayablePage;
