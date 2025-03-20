"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SelectionForm from "@/components/results/SelectionForm";
import StudentResultsTable from "@/components/results/StudentResultsTable";
import { useToast } from "@/components/ui/use-toast";
import { getStudentsByIntakeAndCampus } from "@/lib/actions/student/getStudentsByIntakeAndCampus";
import { saveStudentResults } from "@/lib/actions/results/saveStudentResults ";
import { ContentLayout } from "@/components/layout/content-layout";

interface Student {
  id: string;
  name: string;
  surname: string;
  admissionNumber: string;
  existingMark?: number;
  existingTestScore?: number;
  existingTaskScore?: number;
  existingCompetency?: "competent" | "not_competent";
}

export default function ResultsCapturePage() {
  const { toast } = useToast();
  const [selection, setSelection] = useState<{
    intakeGroupId: string;
    campusId: string;
    outcomeId: string;
  } | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectionComplete = async (newSelection: {
    intakeGroupId: string;
    campusId: string;
    outcomeId: string;
  }) => {
    setIsLoading(true);
    try {
      const studentData = await getStudentsByIntakeAndCampus(
        newSelection.intakeGroupId,
        newSelection.campusId,
        newSelection.outcomeId
      );
      setStudents(studentData);
      setSelection(newSelection);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to load students. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ContentLayout title="Capture Student Results">
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Capture Student Results</h1>

        <Card>
          <CardHeader>
            <CardTitle>Select Class and Outcome</CardTitle>
            <CardDescription>
              Choose an intake group, campus, and outcome to load students for
              assessment.
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

        {!isLoading && selection && students.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Student Assessment</CardTitle>
              <CardDescription>
                Enter marks and set competency status for each student.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StudentResultsTable
                students={students}
                outcomeId={selection.outcomeId}
                campusId={selection.campusId}
                intakeGroupId={selection.intakeGroupId}
                onSave={saveStudentResults}
              />
            </CardContent>
          </Card>
        )}

        {!isLoading && selection && students.length === 0 && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                No students found for the selected criteria.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ContentLayout>
  );
}
