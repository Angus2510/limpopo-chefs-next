"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContentLayout } from "@/components/layout/content-layout";
import { getAssignmentById } from "@/lib/actions/assignments/getAssignmentById";
import { getAssignmentAnswers } from "@/lib/actions/assignments/getAssignmentAnswers";
import { submitScore } from "@/lib/actions/assignments/submitScore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PageProps {
  params: { id: string };
}

export default function MarkAssignmentPage({ params }: PageProps) {
  const { toast } = useToast();
  const [assignment, setAssignment] = useState<any>(null);
  const [answers, setAnswers] = useState<any>(null);
  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignmentData();
  }, [params.id]);

  const loadAssignmentData = async () => {
    try {
      const [assignmentData, answersData] = await Promise.all([
        getAssignmentById(params.id),
        getAssignmentAnswers(params.id),
      ]);
      setAssignment(assignmentData);
      setAnswers(answersData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load assignment data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (questionId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setScores((prev) => ({ ...prev, [questionId]: numValue }));
  };

  const handleSubmitScores = async () => {
    try {
      const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
      await submitScore(params.id, totalScore, "staffId"); // Replace with actual staff ID
      toast({
        title: "Success",
        description: "Scores submitted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit scores",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <ContentLayout title="Mark Assignment">
      <div className="grid grid-cols-2 gap-6 p-4">
        {/* Left side - Assignment Questions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Questions</CardTitle>
            </CardHeader>
            <CardContent>
              {assignment?.questions?.map((question: any, index: number) => (
                <div key={question.id} className="mb-6 p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">Question {index + 1}</h3>
                    <span className="text-sm text-muted-foreground">
                      {question.mark} marks
                    </span>
                  </div>
                  <p className="mb-4">{question.text}</p>
                  {question.options && (
                    <div className="ml-4 text-sm text-muted-foreground">
                      {question.options.map((option: any) => (
                        <div key={option.id}>
                          {option.value ||
                            `${option.columnA} → ${option.columnB}`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right side - Student Answers and Marking */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Answers</CardTitle>
            </CardHeader>
            <CardContent>
              {answers?.map((answer: any, index: number) => (
                <div key={answer.id} className="mb-6 p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">Question {index + 1}</h3>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max={assignment?.questions[index]?.mark}
                        placeholder="Score"
                        className="w-20"
                        value={scores[answer.id] || ""}
                        onChange={(e) =>
                          handleScoreChange(answer.id, e.target.value)
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        / {assignment?.questions[index]?.mark}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    {typeof answer.answer === "string"
                      ? answer.answer
                      : JSON.stringify(answer.answer, null, 2)}
                  </div>
                </div>
              ))}

              <div className="mt-6 flex justify-between items-center">
                <div className="text-lg font-bold">
                  Total Score:{" "}
                  {Object.values(scores).reduce((a, b) => a + b, 0)} /{" "}
                  {assignment?.questions?.reduce(
                    (acc: number, q: any) => acc + Number(q.mark),
                    0
                  )}
                </div>
                <Button onClick={handleSubmitScores}>Submit Marks</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ContentLayout>
  );
}
