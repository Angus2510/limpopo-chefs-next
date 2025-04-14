"use client";

import { useState } from "react";
import { GraduateSelectionForm } from "@/components/graduate/GraduateSelectionForm";
import { Switch } from "@/components/ui/switch";
import { getStudentsByIntakeAndCampus } from "@/lib/actions/student/getStudentsByIntakeAndCampus";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ContentLayout } from "@/components/layout/content-layout";

interface Student {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
  };
  admissionNumber: string;
  alumni: boolean;
}

export default function GraduatePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [graduationStatus, setGraduationStatus] = useState<{
    [key: string]: boolean;
  }>({});

  const handleSelectionComplete = async ({
    intakeGroupId,
    campusId,
  }: {
    intakeGroupId: string[];
    campusId: string;
  }) => {
    setLoading(true);
    try {
      // Use the server action to fetch students
      const studentsData = await getStudentsByIntakeAndCampus(
        intakeGroupId,
        campusId
      );

      // Transform the data to match the Student interface
      const transformedStudents = studentsData.map((student) => ({
        id: student.id,
        profile: {
          firstName: student.name,
          lastName: student.surname,
        },
        admissionNumber: student.admissionNumber,
        alumni: false,
      }));

      setStudents(transformedStudents);

      // Initialize graduation status
      const initialStatus = {};
      transformedStudents.forEach((student) => {
        initialStatus[student.id] = false;
      });
      setGraduationStatus(initialStatus);

      if (transformedStudents.length === 0) {
        toast({
          title: "No Students Found",
          description: "No students found for the selected criteria.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load students",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGraduationToggle = (studentId: string) => {
    setGraduationStatus((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/students/graduate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          graduationStatus,
        }),
      });

      if (!response.ok) throw new Error("Failed to update graduation status");

      toast({
        title: "Success",
        description: "Graduation status updated successfully",
      });
    } catch (error) {
      console.error("Error saving graduation status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update graduation status",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContentLayout>
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-2xl font-bold">Student Graduation Management</h1>

        <GraduateSelectionForm onSelectionComplete={handleSelectionComplete} />

        {loading && <div className="text-center py-4">Loading students...</div>}

        {!loading && students.length > 0 && (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admission Number</TableHead>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Graduate Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.admissionNumber}</TableCell>
                    <TableCell>{student.profile.firstName}</TableCell>
                    <TableCell>{student.profile.lastName}</TableCell>
                    <TableCell>
                      <Switch
                        checked={graduationStatus[student.id]}
                        onCheckedChange={() =>
                          handleGraduationToggle(student.id)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end">
              <Button
                onClick={handleSaveChanges}
                disabled={loading}
                className="min-w-[100px]"
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </ContentLayout>
  );
}
