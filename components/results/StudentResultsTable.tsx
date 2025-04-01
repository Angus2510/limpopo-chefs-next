"use client";

import { useState, useEffect } from "react";
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
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

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
  isMenuAssessment: boolean;
  onSave: (results: StudentResult[]) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
    details?: any[];
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
  isMenuAssessment,
  onSave,
}: StudentResultsTableProps) {
  const [results, setResults] = useState<Record<string, StudentResult>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Initialize results when students prop changes
  useEffect(() => {
    const initialResults: Record<string, StudentResult> = {};
    students.forEach((student) => {
      initialResults[student.id] = {
        studentId: student.id,
        outcomeId,
        campusId,
        intakeGroupId,
        mark: student.existingMark ?? 0,
        testScore: isMenuAssessment
          ? student.existingMark ?? 0
          : student.existingTestScore ?? 0,
        taskScore: isMenuAssessment
          ? student.existingMark ?? 0
          : student.existingTaskScore ?? 0,
        competency: student.existingCompetency || "not_competent",
      };
    });
    setResults(initialResults);
    setHasChanges(false);
    setErrors([]);
  }, [students, outcomeId, campusId, intakeGroupId, isMenuAssessment]);

  const validateScore = (score: string): number | null => {
    const num = parseFloat(score);
    if (isNaN(num) || num < 0 || num > 100) {
      return null;
    }
    return num;
  };

  const handleScoreChange = (
    studentId: string,
    type: "test" | "task" | "total",
    value: string
  ) => {
    const score = value === "" ? 0 : validateScore(value);
    if (score === null) return;

    setResults((prev) => {
      const current = prev[studentId];
      if (!current) return prev;

      const updated = { ...current };

      if (isMenuAssessment || type === "total") {
        updated.mark = score;
        updated.testScore = score;
        updated.taskScore = score;
      } else {
        if (type === "test") updated.testScore = score;
        if (type === "task") updated.taskScore = score;
        updated.mark = (updated.testScore + updated.taskScore) / 2;
      }

      // Auto-set competency based on mark
      updated.competency = updated.mark >= 50 ? "competent" : "not_competent";

      return { ...prev, [studentId]: updated };
    });
    setHasChanges(true);
  };

  const handleCompetencyChange = (
    studentId: string,
    value: "competent" | "not_competent"
  ) => {
    setResults((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], competency: value },
    }));
    setHasChanges(true);
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      setErrors([]);

      if (!hasChanges) {
        toast({
          title: "No Changes",
          description: "No changes to save",
          variant: "default",
        });
        return;
      }

      const resultsToSave = Object.values(results);
      const response = await onSave(resultsToSave);

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Results saved successfully",
          variant: "default",
        });
        setHasChanges(false);
      } else {
        throw new Error(response.error || "Failed to save results");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save results";
      setErrors([message]);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        {errors.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </AlertDescription>
          </Alert>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Number</TableHead>
              <TableHead>Student Name</TableHead>
              {!isMenuAssessment && (
                <>
                  <TableHead>Test Score</TableHead>
                  <TableHead>Task Score</TableHead>
                </>
              )}
              <TableHead>
                {isMenuAssessment ? "Total Mark" : "Overall %"}
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
                {!isMenuAssessment && (
                  <>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={results[student.id]?.testScore || ""}
                        onChange={(e) =>
                          handleScoreChange(student.id, "test", e.target.value)
                        }
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={results[student.id]?.taskScore || ""}
                        onChange={(e) =>
                          handleScoreChange(student.id, "task", e.target.value)
                        }
                        className="w-24"
                      />
                    </TableCell>
                  </>
                )}
                <TableCell>
                  {isMenuAssessment ? (
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={results[student.id]?.mark || ""}
                      onChange={(e) =>
                        handleScoreChange(student.id, "total", e.target.value)
                      }
                      className="w-24"
                    />
                  ) : (
                    <span className="font-medium">
                      {results[student.id]?.mark.toFixed(1)}%
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Select
                    value={results[student.id]?.competency || "not_competent"}
                    onValueChange={(value: "competent" | "not_competent") =>
                      handleCompetencyChange(student.id, value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="competent">Competent</SelectItem>
                      <SelectItem value="not_competent">
                        Not Competent
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            {hasChanges ? "You have unsaved changes" : "All changes saved"}
          </div>
          <Button onClick={handleSubmit} disabled={isSaving || !hasChanges}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save Results"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default StudentResultsTable;
