"use client";

import { useState, useEffect } from "react";
import AttendanceCalendar from "@/components/attendance/AttendanceCalendar";
import SelectionForm from "@/components/results/SelectionForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { updateGroupAttendance } from "@/lib/actions/attendance/getStudentAttendance";
import { getStudentsByIntakeAndCampus } from "@/lib/actions/student/getStudentsByIntakeAndCampus";

type AttendanceStatus =
  | "full"
  | "absent"
  | "absent with reason"
  | "W.E.L"
  | "sick";

interface PendingChange {
  date: Date;
  status: AttendanceStatus;
  studentId: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

export default function GroupAttendancePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [selection, setSelection] = useState<{
    intakeGroupId: string[];
    campusId: string;
    outcomeId: string;
  } | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  const handleSelectionComplete = async (newSelection: {
    intakeGroupId: string[];
    campusId: string;
    outcomeId: string;
  }) => {
    setIsLoading(true);
    try {
      setSelection(newSelection);

      // Fetch students using the existing function
      const studentsData = await getStudentsByIntakeAndCampus(
        newSelection.intakeGroupId,
        newSelection.campusId
      );

      // Transform the data to match Student interface
      const transformedStudents: Student[] = studentsData.map((student) => ({
        id: student.id,
        firstName: student.name,
        lastName: student.surname,
      }));

      setStudents(transformedStudents);
      setPendingChanges([]); // Clear pending changes when selection changes

      toast({
        title: "Group selected",
        description: `Loaded ${transformedStudents.length} students`,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load group students",
        variant: "destructive",
      });
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttendanceUpdate = async (date: Date, status: string) => {
    if (!selection?.intakeGroupId[0] || students.length === 0) {
      toast({
        title: "Error",
        description: "No group or students selected",
        variant: "destructive",
      });
      return false;
    }

    const validStatus = status as AttendanceStatus;
    if (
      !["full", "absent", "absent with reason", "W.E.L", "sick"].includes(
        validStatus
      )
    ) {
      toast({
        title: "Error",
        description: "Invalid attendance status",
        variant: "destructive",
      });
      return false;
    }

    // Create a new Date object and set time to midnight
    const formattedDate = new Date(date);
    formattedDate.setHours(0, 0, 0, 0);

    // Add pending changes for all students in the group
    students.forEach((student) => {
      setPendingChanges((prev) => {
        const newChanges = prev.filter(
          (change) =>
            !(
              change.date.getTime() === formattedDate.getTime() &&
              change.studentId === student.id
            )
        );
        newChanges.push({
          date: formattedDate,
          status: validStatus,
          studentId: student.id,
        });
        return newChanges;
      });
    });

    toast({
      title: "Changes pending",
      description: `Attendance marked as ${status} for ${students.length} students. Click 'Save Changes' to apply.`,
    });

    return true;
  };

  const saveAllChanges = async () => {
    if (!selection || pendingChanges.length === 0) return;

    setIsLoading(true);
    try {
      // Group changes by date and status for batch processing
      const changesByDateAndStatus = pendingChanges.reduce((acc, change) => {
        const key = `${change.date.toISOString()}_${change.status}`;
        if (!acc[key]) {
          acc[key] = {
            date: change.date,
            status: change.status,
            studentIds: [],
          };
        }
        acc[key].studentIds.push(change.studentId);
        return acc;
      }, {} as Record<string, { date: Date; status: AttendanceStatus; studentIds: string[] }>);

      let successCount = 0;
      let failCount = 0;

      // Process each group of changes
      for (const { date, status, studentIds } of Object.values(
        changesByDateAndStatus
      )) {
        try {
          const result = await updateGroupAttendance(
            studentIds,
            date,
            status,
            selection.campusId,
            selection.intakeGroupId[0]
          );

          if (result?.success) {
            successCount += studentIds.length;
          } else {
            failCount += studentIds.length;
          }
        } catch (error) {
          console.error("Error saving group changes:", error);
          failCount += studentIds.length;
        }
      }

      if (successCount > 0) {
        toast({
          title: "Changes saved",
          description: `Successfully updated attendance for ${successCount} students${
            failCount > 0 ? `, ${failCount} failed` : ""
          }`,
        });
        setPendingChanges([]);

        // Refresh the calendar after successful save
        const calendarDate = new Date();
        handleAttendanceUpdate(calendarDate, "full");
      } else {
        toast({
          title: "Error",
          description: "Failed to save any changes",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in saveAllChanges:", error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Group Attendance</h1>
        <p className="text-gray-600 mt-2">
          Manage attendance for entire groups
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Group</CardTitle>
          <CardDescription>
            Choose an intake group to manage attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SelectionForm onSelectionComplete={handleSelectionComplete} />
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {!isLoading && selection && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Group Attendance Calendar
                </h2>
                <p className="text-sm text-gray-500">
                  Managing {students.length} students
                </p>
              </div>
              <Button
                variant="default"
                onClick={saveAllChanges}
                disabled={pendingChanges.length === 0}
              >
                Save Changes ({pendingChanges.length})
              </Button>
            </div>
            <AttendanceCalendar
              studentId={selection.intakeGroupId[0]}
              onAttendanceChange={handleAttendanceUpdate}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
