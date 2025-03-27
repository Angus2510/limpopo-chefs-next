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
import { MENU_OUTCOMES } from "@/utils/menuOutcomes";

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
  outcomeTitle: string;
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
  outcomeTitle,
  onSave,
}: StudentResultsTableProps) {
  const isMenuOutcome = MENU_OUTCOMES.includes(outcomeTitle);

  const [results, setResults] = useState<Record<string, StudentResult>>(() => {
    const initialResults: Record<string, StudentResult> = {};
    students.forEach((student) => {
      const mark = student.existingMark ?? 0;

      initialResults[student.id] = {
        studentId: student.id,
        outcomeId,
        campusId,
        intakeGroupId,
        testScore: isMenuOutcome ? mark : student.existingTestScore ?? 0,
        taskScore: isMenuOutcome ? mark : student.existingTaskScore ?? 0,
        mark: mark,
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

  const handleTotalMarkChange = (studentId: string, mark: string) => {
    if (mark === "") {
      setResults((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          mark: 0,
          testScore: 0,
          taskScore: 0,
        },
      }));
      return;
    }

    const numericMark = parseFloat(mark);
    if (isNaN(numericMark) || numericMark < 0 || numericMark > 100) {
      return;
    }

    setResults((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        mark: numericMark,
        testScore: numericMark,
        taskScore: numericMark,
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
      const resultsToSave = Object.values(results);

      const response = await onSave(resultsToSave);

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Results saved successfully",
          variant: "default",
        });

        if (response.errors) {
          console.warn("Some results failed to save:", response.errors);
          toast({
            title: "Warning",
            description: "Some results may need to be re-submitted",
            variant: "warning",
          });
        }
      } else {
        throw new Error(response.error || "Failed to save results");
      }
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
            {!isMenuOutcome && (
              <>
                <TableHead>Test Score</TableHead>
                <TableHead>Task Score</TableHead>
              </>
            )}
            <TableHead>
              {isMenuOutcome ? "Total Mark" : "Total Score"}
            </TableHead>
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
              {!isMenuOutcome && (
                <>
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
                </>
              )}
              <TableCell>
                {isMenuOutcome ? (
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={displayValue(results[student.id].mark)}
                    onChange={(e) =>
                      handleTotalMarkChange(student.id, e.target.value)
                    }
                    className="w-20"
                  />
                ) : (
                  <span className="font-medium">
                    {results[student.id].mark.toFixed(1)}%
                  </span>
                )}
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
