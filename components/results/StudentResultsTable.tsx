"use client";

import { useState, useMemo, useEffect } from "react";
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
  admissionNumber: string; // Added admission number
  existingMark?: number;
  existingTestScore?: number;
  existingTaskScore?: number;
  existingCompetency?: "competent" | "not_competent";
}

interface StudentResultsTableProps {
  students: Student[];
  outcomeId: string;
  onSave: (results: StudentResult[]) => Promise<void>;
}

interface StudentResult {
  studentId: string;
  outcomeId: string;
  mark: number; // Total mark (test + task)
  testScore: number; // Test score
  taskScore: number; // Task score
  competency: "competent" | "not_competent";
}

export function StudentResultsTable({
  students,
  outcomeId,
  onSave,
}: StudentResultsTableProps) {
  const [results, setResults] = useState<Record<string, StudentResult>>(() => {
    // Initialize with existing data if available
    const initialResults: Record<string, StudentResult> = {};
    students.forEach((student) => {
      const testScore = student.existingTestScore ?? 0;
      const taskScore = student.existingTaskScore ?? 0;
      const totalScore = student.existingMark ?? testScore + taskScore;

      initialResults[student.id] = {
        studentId: student.id,
        outcomeId,
        testScore: testScore,
        taskScore: taskScore,
        mark: totalScore,
        competency: student.existingCompetency || "not_competent",
      };
    });
    return initialResults;
  });

  const [isSaving, setIsSaving] = useState(false);

  // Update total mark when test or task score changes
  const updateTotalMark = (
    studentId: string,
    testScore: number,
    taskScore: number
  ) => {
    const total = testScore + taskScore;

    setResults((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        testScore,
        taskScore,
        mark: total,
      },
    }));
  };

  const handleTestScoreChange = (studentId: string, score: string) => {
    const numericScore = parseFloat(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      return;
    }

    const taskScore = results[studentId].taskScore;
    updateTotalMark(studentId, numericScore, taskScore);
  };

  const handleTaskScoreChange = (studentId: string, score: string) => {
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
      await onSave(Object.values(results));
      toast({
        title: "Results saved successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error saving results:", error);
      toast({
        title: "Failed to save results",
        description: "Please try again later",
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
                  value={results[student.id].testScore}
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
                  value={results[student.id].taskScore}
                  onChange={(e) =>
                    handleTaskScoreChange(student.id, e.target.value)
                  }
                  className="w-20"
                />
              </TableCell>
              <TableCell className="font-medium">
                {results[student.id].mark}
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
