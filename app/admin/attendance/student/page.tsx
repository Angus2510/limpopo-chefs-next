"use client";

import React, { useState } from "react";
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

const StudentAttendanceTracker = () => {
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("all");

  // Get current year
  const currentYear = new Date().getFullYear();

  // All months of the year
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

  // These would come from your database
  const students = [];
  const attendanceData = [];

  const renderAttendanceStatus = (status) => {
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

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Student&#39;s Attendance and Success
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

            <Select
              value={selectedTimeFrame}
              onValueChange={setSelectedTimeFrame}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time frame" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="year">This year</SelectItem>
                <SelectItem value="semester">This semester</SelectItem>
                <SelectItem value="month">This month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="w-full max-w-xs">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button className="w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                {selectedStudent
                  ? students.find((student) => student.id === selectedStudent)
                      ?.name || "Select student"
                  : "Select student"}
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search student..." />
                <CommandEmpty>No student found.</CommandEmpty>
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
                      {student.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Current Year Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">{currentYear}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {months.map((month, monthIndex) => (
              <div key={monthIndex} className="flex flex-col">
                <h3 className="text-sm font-medium mb-2">{month}</h3>
                <div className="grid grid-cols-5 gap-1">
                  {/* Days of week header */}
                  <div className="text-xs text-gray-500">Mon</div>
                  <div className="text-xs text-gray-500">Tue</div>
                  <div className="text-xs text-gray-500">Wed</div>
                  <div className="text-xs text-gray-500">Thu</div>
                  <div className="text-xs text-gray-500">Fri</div>

                  {/* Calendar cells */}
                  {Array(25)
                    .fill()
                    .map((_, i) => (
                      <div key={i} className="flex items-center justify-center">
                        {i < 20 ? renderAttendanceStatus("empty") : null}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceTracker;
