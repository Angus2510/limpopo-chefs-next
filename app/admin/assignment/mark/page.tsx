"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ContentLayout } from "@/components/layout/content-layout";
import { fetchUnmarkedAssignments } from "@/lib/actions/assignments/fetchUnmarkedAssignments";
import { submitScore } from "@/lib/actions/assignments/submitScore";
import useAuthStore from "@/store/authStore"; // Changed to useAuthStore
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

interface AssignmentResult {
  id: string;
  dateTaken: Date;
  scores: number | null;
  student: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  assignment: {
    id: string;
    title: string;
  };
}

export default function MarkAssignmentsPage() {
  const { toast } = useToast();
  const [results, setResults] = useState<AssignmentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<AssignmentResult | null>(
    null
  );
  const [score, setScore] = useState("");
  const [markingDialog, setMarkingDialog] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await fetchUnmarkedAssignments();

      if (Array.isArray(data)) {
        setResults(data);
      } else {
        setResults([]);
        toast({
          title: "Error",
          description: "Invalid data format received",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to load assignments:", error);
      setResults([]);
      toast({
        title: "Error",
        description: "Failed to load assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkTest = (result: AssignmentResult) => {
    setSelectedTest(result);
    setMarkingDialog(true);
  };

  const handleSubmitScore = async () => {
    if (!selectedTest || !score || !user?.id) {
      toast({
        title: "Error",
        description: "Please enter a valid score",
        variant: "destructive",
      });
      return;
    }

    try {
      const scoreNum = parseFloat(score);
      if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
        throw new Error("Score must be between 0 and 100");
      }

      await submitScore(selectedTest.id, scoreNum, user.id);

      setMarkingDialog(false);
      setSelectedTest(null);
      setScore("");
      await loadAssignments();

      toast({
        title: "Success",
        description: "Score submitted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit score",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <ContentLayout title="Mark Assignments">
        <div className="flex justify-center items-center h-48">
          <p>Loading...</p>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Mark Assignments">
      <div className="space-y-4">
        {results.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              No unmarked assignments found
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>
                    {result.student.profile.firstName}{" "}
                    {result.student.profile.lastName}
                  </TableCell>
                  <TableCell>{result.assignment.title}</TableCell>
                  <TableCell>
                    {format(new Date(result.dateTaken), "PPp")}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => handleMarkTest(result)}>
                      Mark Test
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog
          open={markingDialog}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedTest(null);
              setScore("");
            }
            setMarkingDialog(open);
          }}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                Mark Test - {selectedTest?.student.firstName}{" "}
                {selectedTest?.student.lastName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">
                  Assignment: {selectedTest?.assignment.title}
                </h3>
                <div className="space-y-4">
                  {selectedTest?.answers.map((answer, index) => (
                    <div key={index} className="border-t pt-4">
                      <div className="flex justify-between items-start">
                        <p className="font-medium">Question {index + 1}</p>
                        <span className="text-sm text-muted-foreground">
                          {selectedTest?.assignment.questions[index]?.mark ||
                            "0"}{" "}
                          marks
                        </span>
                      </div>
                      <p className="mt-2 text-muted-foreground text-sm">
                        {selectedTest?.assignment.questions[index]?.text}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap bg-muted p-2 rounded">
                        {answer.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  placeholder="Enter score"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-32"
                  min="0"
                  max="100"
                />
                <Button
                  onClick={handleSubmitScore}
                  disabled={!score || !selectedTest}
                >
                  Submit Score
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ContentLayout>
  );
}
