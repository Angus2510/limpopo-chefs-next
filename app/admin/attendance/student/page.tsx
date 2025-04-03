"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStudentAttendance } from "@/lib/actions/attendance/getStudentAttendance";
import { getStudentsData } from "@/lib/actions/student/studentsQuery";
import { useToast } from "@/components/ui/use-toast";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
}

interface AttendanceRecord {
  id: string;
  date: Date;
  status: "full" | "half" | "lesson" | "sick" | "absent";
  timeCheckedIn?: Date | null;
}

const StudentAttendanceTracker = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("all");
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const currentYear = new Date().getFullYear();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Helper functions for date calculations
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderAttendanceStatus = (status: string) => {
    switch (status) {
      case "full":
        return <div className="w-6 h-6 rounded-full bg-black"></div>;
      case "half":
        return <div className="w-6 h-6 rounded-full bg-gray-500"></div>;
      case "lesson":
        return <div className="w-6 h-6 rounded-full bg-gray-300"></div>;
      case "sick":
        return (
          <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white"></div>
        );
      default:
        return <div className="w-6 h-6 rounded-full bg-gray-100"></div>;
    }
  };

  // Updated search students handler
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setStudents([]);
      return;
    }

    setIsSearching(true);
    try {
      const { students } = await getStudentsData({
        search: query,
        page: 1,
        per_page: 5,
      });

      const transformedStudents = students.map((student) => ({
        id: student.id,
        firstName: student.profile.firstName,
        lastName: student.profile.lastName,
        admissionNumber: student.admissionNumber,
      }));

      setStudents(transformedStudents);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description: "Failed to search for students",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Load attendance data when student is selected
  useEffect(() => {
    const loadAttendanceData = async () => {
      if (!selectedStudent) {
        setAttendanceData([]);
        return;
      }

      setLoading(true);
      try {
        const data = await getStudentAttendance(selectedStudent, currentYear);
        // Ensure we always set an array, even if empty
        setAttendanceData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading attendance:", error);
        toast({
          title: "Error",
          description: "Failed to load attendance data",
          variant: "destructive",
        });
        setAttendanceData([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    loadAttendanceData();
  }, [selectedStudent, currentYear, toast]);

  const getAttendanceForDate = (date: Date) => {
    const record = attendanceData.find(
      (record) => new Date(record.date).toDateString() === date.toDateString()
    );
    return record?.status || "empty";
  };

  const renderMonthCells = (monthIndex: number) => {
    const daysInMonth = getDaysInMonth(currentYear, monthIndex);
    const firstDay = getFirstDayOfMonth(currentYear, monthIndex);
    const cells = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      cells.push(<div key={`empty-${i}`} className="h-6" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, monthIndex, day);
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      const status = getAttendanceForDate(date);
      cells.push(
        <div key={day} className="flex items-center justify-center">
          {renderAttendanceStatus(status)}
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Student&apos;s Attendance and Success
          </h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-black"></div>
              <span className="text-sm">Full day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-500"></div>
              <span className="text-sm">Half day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-300"></div>
              <span className="text-sm">One lesson</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white"></div>
              <span className="text-sm">Sick leave</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-xs">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button className="w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                {selectedStudent
                  ? students.find((s) => s.id === selectedStudent)
                    ? `${
                        students.find((s) => s.id === selectedStudent)
                          ?.firstName
                      } ${
                        students.find((s) => s.id === selectedStudent)?.lastName
                      }`
                    : "Select student"
                  : "Select student"}
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput
                  placeholder="Search student..."
                  value={searchQuery}
                  onValueChange={handleSearch}
                />
                <CommandEmpty>
                  {isSearching ? "Searching..." : "No student found."}
                </CommandEmpty>
                <CommandGroup>
                  {students.map((student) => (
                    <CommandItem
                      key={student.id}
                      value={student.id}
                      onSelect={(currentValue) => {
                        setSelectedStudent(
                          currentValue === selectedStudent ? "" : currentValue
                        );
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedStudent === student.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {`${student.firstName} ${student.lastName} (${student.admissionNumber})`}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            Loading attendance data...
          </div>
        ) : (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">{currentYear}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {months.map((month, monthIndex) => (
                <div key={monthIndex} className="flex flex-col">
                  <h3 className="text-sm font-medium mb-2">{month}</h3>
                  <div className="grid grid-cols-5 gap-1">
                    <div className="text-xs text-gray-500">Mon</div>
                    <div className="text-xs text-gray-500">Tue</div>
                    <div className="text-xs text-gray-500">Wed</div>
                    <div className="text-xs text-gray-500">Thu</div>
                    <div className="text-xs text-gray-500">Fri</div>
                    {renderMonthCells(monthIndex)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendanceTracker;
