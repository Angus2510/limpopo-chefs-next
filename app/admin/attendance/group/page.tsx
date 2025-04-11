"use client";

import { useState } from "react";
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

export default function GroupAttendancePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selection, setSelection] = useState<{
    intakeGroupId: string[];
    campusId: string;
    outcomeId: string;
  } | null>(null);

  const handleSelectionComplete = async (newSelection: {
    intakeGroupId: string[];
    campusId: string;
    outcomeId: string;
  }) => {
    setIsLoading(true);
    try {
      setSelection(newSelection);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
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
            <AttendanceCalendar
              type="group"
              groupId={selection.intakeGroupId[0]}
              campusId={selection.campusId}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
