"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CompetencyRadio from "./CompentencyRadio";
import { toast } from "@/components/ui/use-toast";

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

interface StudentResultsTableProps {
  students: Student[];
  outcomeId: string;
  campusId: string;
  intakeGroupId: string;
  onSave: (results: StudentResult[]) => Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }>;
}

interface StudentResult {
  studentId: string;
  outcomeId: string;
  mark: number;
  testScore: number;
  taskScore: number;
  competency: "competent" | "not_competent";
  campusId: string;
  intakeGroupId: string;
}

export function StudentResultsTable({
  students,
  outcomeId,
  campusId,
  intakeGroupId,
  onSave,
}: StudentResultsTableProps) {
  const [results, setResults] = useState<Record<string, StudentResult>>(() => {
    const initialResults: Record<string, StudentResult> = {};
    students.forEach((student) => {
      const testScore = student.existingTestScore ?? 0;
      const taskScore = student.existingTaskScore ?? 0;
      const totalScore = student.existingMark ?? (testScore + taskScore) / 2;

      initialResults[student.id] = {
        studentId: student.id,
        outcomeId,
        campusId,
        intakeGroupId,
        testScore: testScore,
        taskScore: taskScore,
        mark: totalScore,
        competency: student.existingCompetency || "not_competent",
      };
    });
    return initialResults;
  });

  const [isSaving, setIsSaving] = useState(false);

  const displayValue = (value: number) => (value === 0 ? "" : value.toString());

  const updateTotalMark = (
    studentId: string,
    testScore: number,
    taskScore: number
  ) => {
    const average = (testScore + taskScore) / 2;

    setResults((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        testScore,
        taskScore,
        mark: average,
      },
    }));
  };

  const handleTestScoreChange = (studentId: string, score: string) => {
    if (score === "") {
      const taskScore = results[studentId].taskScore;
      updateTotalMark(studentId, 0, taskScore);
      return;
    }

    const numericScore = parseFloat(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      return;
    }

    const taskScore = results[studentId].taskScore;
    updateTotalMark(studentId, numericScore, taskScore);
  };

  const handleTaskScoreChange = (studentId: string, score: string) => {
    if (score === "") {
      const testScore = results[studentId].testScore;
      updateTotalMark(studentId, testScore, 0);
      return;
    }

    const numericScore = parseFloat(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      return;
    }

    const testScore = results[studentId].testScore;
    updateTotalMark(studentId, testScore, numericScore);
  };

  const handleCompetencyChange = (
    studentId: string,
    competency: "competent" | "not_competent"
  ) => {
    setResults((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        competency,
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);

      const resultsToSave = Object.values(results).map((r) => ({
        studentId: r.studentId,
        outcomeId: r.outcomeId,
        mark: r.mark,
        testScore: r.testScore,
        taskScore: r.taskScore,
        competency: r.competency,
        campusId: r.campusId,
        intakeGroupId: r.intakeGroupId,
      }));

      const response = await onSave(resultsToSave);

      if (!response?.success) {
        throw new Error(response?.error || "Failed to save results");
      }

      toast({
        title: "Success",
        description: "Results saved successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error saving results:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save results",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student Number</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead>Test Score</TableHead>
            <TableHead>Task Score</TableHead>
            <TableHead>Total Score</TableHead>
            <TableHead>Competency</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">
                {student.admissionNumber}
              </TableCell>
              <TableCell>
                {student.name} {student.surname}
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={displayValue(results[student.id].testScore)}
                  onChange={(e) =>
                    handleTestScoreChange(student.id, e.target.value)
                  }
                  className="w-20"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={displayValue(results[student.id].taskScore)}
                  onChange={(e) =>
                    handleTaskScoreChange(student.id, e.target.value)
                  }
                  className="w-20"
                />
              </TableCell>
              <TableCell className="font-medium">
                {results[student.id].mark.toFixed(1)}%
              </TableCell>
              <TableCell>
                <CompetencyRadio
                  value={results[student.id].competency}
                  onChange={(value) =>
                    handleCompetencyChange(student.id, value)
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Results"}
        </Button>
      </div>
    </div>
  );
}

export default StudentResultsTable;
