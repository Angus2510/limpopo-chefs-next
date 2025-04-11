"use client";

import { useState, useEffect } from "react";
import { getStudentsData } from "@/lib/actions/student/studentsQuery";
import { updateStudentAttendance } from "@/lib/actions/attendance/getStudentAttendance";
import AttendanceCalendar from "@/components/attendance/AttendanceCalendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { ContentLayout } from "@/components/layout/content-layout";
import { fetchStudentWelRecords } from "@/lib/actions/student/fetchStudentWelRecords";

interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  email: string;
}

type AttendanceStatus =
  | "full"
  | "absent"
  | "absent with reason"
  | "W.E.L"
  | "sick";

interface PendingChange {
  date: Date;
  status: AttendanceStatus;
}

export default function StudentAttendancePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searching, setSearching] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [welRecords, setWelRecords] = useState<any[]>([]);

  useEffect(() => {
    console.log("Current pending changes:", pendingChanges);
  }, [pendingChanges]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    setSearching(true);
    try {
      const result = await getStudentsData({
        search: searchQuery,
        page: 1,
        per_page: 5,
      });
      setStudents(result.students);

      if (result.students.length === 0) {
        toast({
          title: "No students found",
          description: "Try a different search term",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error searching students:", error);
      toast({
        title: "Error",
        description: "Failed to search for students",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSelectStudent = async (student: Student) => {
    setSelectedStudent(student);
    setStudents([]);
    setSearchQuery("");
    setPendingChanges([]);

    // Fetch WEL records
    try {
      const records = await fetchStudentWelRecords(student.id);
      setWelRecords(records);
    } catch (error) {
      console.error("Error fetching WEL records:", error);
      toast({
        title: "Error",
        description: "Failed to load WEL records",
        variant: "destructive",
      });
    }

    toast({
      title: "Student selected",
      description: `Viewing attendance for ${student.firstName} ${student.lastName}`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleAttendanceUpdate = async (date: Date, status: string) => {
    if (!selectedStudent) {
      console.log("No student selected");
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

    // Update pending changes
    setPendingChanges((prev) => {
      const newChanges = prev.filter(
        (change) => change.date.getTime() !== formattedDate.getTime()
      );
      newChanges.push({ date: formattedDate, status: validStatus });
      return newChanges;
    });

    toast({
      title: "Change pending",
      description: `Attendance marked as ${status}. Click 'Save Changes' to apply.`,
    });

    return true;
  };

  const saveAllChanges = async () => {
    if (!selectedStudent || pendingChanges.length === 0) return;

    let successCount = 0;
    let failCount = 0;

    for (const change of pendingChanges) {
      try {
        const result = await updateStudentAttendance(
          selectedStudent.id,
          change.date,
          change.status
        );

        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error("Error saving change:", error);
        failCount++;
      }
    }

    if (successCount > 0) {
      toast({
        title: "Changes saved",
        description: `Successfully saved ${successCount} changes${
          failCount > 0 ? `, ${failCount} failed` : ""
        }`,
      });
      setPendingChanges([]); // Clear pending changes after successful save
    } else if (failCount > 0) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    }
  };

  return (
    <ContentLayout title="Student Attendance Management">
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">
          Student Attendance Management
        </h1>

        <div className="flex gap-4 mb-6">
          <Input
            type="text"
            placeholder="Search by name, email or student number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="max-w-md"
          />
          <Button onClick={handleSearch} disabled={searching} variant="default">
            {searching ? "Searching..." : "Search"}
          </Button>
          {selectedStudent && (
            <Button variant="outline" onClick={() => setSelectedStudent(null)}>
              Clear Selection
            </Button>
          )}
        </div>

        {students.length > 0 && (
          <div className="mb-8 overflow-hidden border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admission #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.admissionNumber}</TableCell>
                    <TableCell>
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectStudent(student)}
                      >
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {selectedStudent && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">
                    Attendance Calendar for {selectedStudent.firstName}{" "}
                    {selectedStudent.lastName}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Admission #: {selectedStudent.admissionNumber}
                  </p>
                </div>
                <Button
                  variant="default"
                  onClick={saveAllChanges}
                  disabled={pendingChanges.length === 0}
                  className="ml-4"
                >
                  Save Changes ({pendingChanges.length})
                </Button>
              </div>
            </div>
            <AttendanceCalendar
              studentId={selectedStudent.id}
              onAttendanceChange={handleAttendanceUpdate}
              welRecords={welRecords}
              key={selectedStudent.id}
            />
          </div>
        )}
      </div>
    </ContentLayout>
  );
}
