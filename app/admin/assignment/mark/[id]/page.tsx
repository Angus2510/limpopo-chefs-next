"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContentLayout } from "@/components/layout/content-layout";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getAssignmentAnswers } from "@/lib/actions/assignments/getAssignmentAnswers";
import { submitScore } from "@/lib/actions/assignments/submitScore";
import React from "react";

interface PageProps {
  params: { id: string } | Promise<{ id: string }>;
}

interface Question {
  id: string;
  text: string;
  type: string;
  mark: string;
  options: {
    id: string;
    value?: string;
    columnA?: string;
    columnB?: string;
  }[];
}

interface StudentAnswer {
  question: string;
  answer: string;
}

interface TransformedResult {
  id: string;
  dateTaken: Date;
  scores: string | null;
  student: {
    id: string;
    firstName: string;
    lastName: string;
  };
  assignment: {
    id: string;
    title: string;
    type: string;
    duration: number;
    password: string;
    availableFrom: Date;
    intakeGroups: string[];
    outcome: string[];
    questions: Question[];
  };
  answers: string[];
}

export default function MarkAssignmentPage({ params }: PageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [transformedResult, setTransformedResult] =
    useState<TransformedResult | null>(null);
  const [parsedAnswers, setParsedAnswers] = useState<StudentAnswer[]>([]);
  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      console.log("⚡ Component mounted, params:", params);

      try {
        // Properly unwrap params regardless of whether it's a Promise or not
        const resolvedParams =
          params instanceof Promise ? await params : params;
        const id = resolvedParams.id;

        // Save debug info
        setDebugInfo({
          paramsType: params instanceof Promise ? "Promise" : "Object",
          resolvedParams,
          id,
        });

        if (id) {
          await loadAssignmentData(id);
        } else {
          setError("Invalid assignment ID");
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ Error resolving params:", err);
        setError(
          `Failed to load assignment data: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        setLoading(false);
      }
    };

    loadData();
  }, [params]);

  const loadAssignmentData = async (id: string) => {
    try {
      // Log the exact ID we're using
      console.log("🔍 Loading assignment data for ID:", id);

      // Fetch the data, making sure to pass a string
      const data = await getAssignmentAnswers(String(id));
      console.log("📊 Raw data received:", data);

      // Check if we received any data
      if (!data) {
        console.error("❌ No data returned from getAssignmentAnswers");
        setError("Could not load student submission - No data returned");
        setLoading(false);
        return;
      }

      // If data is an empty array, show specific error
      if (Array.isArray(data) && data.length === 0) {
        console.error("❌ Empty array returned from getAssignmentAnswers");
        setError("No assignment submission found with this ID");
        setLoading(false);
        return;
      }

      // Check if the data has the required structure
      if (!data.student || !data.assignment) {
        console.error("❌ Data is missing required fields:", data);
        setError(
          `Incomplete data returned from server: ${JSON.stringify(
            data
          ).substring(0, 100)}...`
        );
        setLoading(false);
        return;
      }

      console.log("✅ Transformed results loaded:", {
        id: data.id,
        student: `${data.student?.firstName} ${data.student?.lastName}`,
        assignmentTitle: data.assignment?.title,
        answersCount: data.answers?.length || 0,
      });

      // Store the data
      setTransformedResult(data);

      // Parse the answers
      console.log("🧩 Parsing answers...");
      try {
        if (Array.isArray(data.answers)) {
          const answers = data.answers.map((answer, index) => {
            console.log(`Processing answer ${index}:`, answer);
            try {
              if (typeof answer === "string") {
                const parsed = JSON.parse(answer);
                console.log(`✓ Successfully parsed answer ${index}:`, parsed);
                return parsed;
              } else {
                console.log(`ℹ️ Answer ${index} is already parsed:`, answer);
                return answer;
              }
            } catch (parseError) {
              console.error(`❌ Error parsing answer ${index}:`, parseError);
              return {
                question: `question_${index}`,
                answer: "Error parsing answer",
              };
            }
          });
          console.log("🧩 All answers parsed:", answers);
          setParsedAnswers(answers);
        } else {
          console.error("❌ Answers is not an array:", data.answers);
          setParsedAnswers([]);
        }
      } catch (parseError) {
        console.error("❌ Error parsing answers:", parseError);
        setParsedAnswers([]);
      }

      // Initialize scores
      if (data.scores) {
        console.log("💯 Initializing scores from data:", data.scores);
        try {
          const parsedScores =
            typeof data.scores === "string"
              ? JSON.parse(data.scores)
              : data.scores;
          console.log("💯 Parsed scores:", parsedScores);
          setScores(parsedScores);
        } catch (e) {
          console.error("❌ Failed to parse scores:", e);
          setScores({});
        }
      } else {
        console.log("ℹ️ No existing scores found");
        // Initialize empty scores
        const emptyScores = {};
        data.assignment.questions.forEach((question) => {
          emptyScores[question.id] = 0;
        });
        setScores(emptyScores);
      }
    } catch (error) {
      console.error("❌ Failed to load assignment:", error);
      setError(
        `Failed to load assignment data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
      console.log("🏁 Finished loading data");
    }
  };

  const handleScoreChange = (questionId: string, value: string) => {
    console.log("🔄 Score changed:", { questionId, value });
    const numValue = parseFloat(value) || 0;
    setScores((prev) => {
      const updated = { ...prev, [questionId]: numValue };
      console.log("💯 Updated scores:", updated);
      return updated;
    });
  };

  const handleSubmitScores = async () => {
    try {
      if (!transformedResult) {
        console.error("❌ Missing transformed results");
        return;
      }

      console.log("📝 Submitting scores:", scores);

      const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
      const maxScore = transformedResult.assignment.questions.reduce(
        (acc, q) => acc + Number(q.mark),
        0
      );

      console.log("📊 Score validation:", { totalScore, maxScore });

      if (totalScore > maxScore) {
        console.error("❌ Score exceeds maximum");
        toast({
          title: "Error",
          description: "Total score cannot exceed maximum marks",
          variant: "destructive",
        });
        return;
      }

      console.log("🚀 Submitting to API:", {
        id: transformedResult.id,
        scores,
      });
      await submitScore(transformedResult.id, scores, "staffId");

      console.log("✅ Scores submitted successfully");
      toast({
        title: "Success",
        description: "Scores submitted successfully",
      });

      router.push("/admin/assignments");
    } catch (error) {
      console.error("❌ Failed to submit scores:", error);
      toast({
        title: "Error",
        description: "Failed to submit scores",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <ContentLayout title="Loading...">
        <div className="flex justify-center items-center h-48">
          Loading assignment data...
        </div>
      </ContentLayout>
    );
  }

  if (error || !transformedResult) {
    return (
      <ContentLayout title="Error">
        <div className="flex flex-col justify-center items-center h-48">
          <div className="text-destructive font-medium mb-4">
            {error || "Could not load assignment data"}
          </div>
          {debugInfo && (
            <div className="text-sm text-muted-foreground mb-4 max-w-md text-center">
              <p>Debug info:</p>
              <pre className="bg-muted p-2 rounded overflow-auto max-h-40 text-xs">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
          <Button
            onClick={() => router.push("/admin/assignments")}
            variant="outline"
          >
            Back to Assignments
          </Button>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout
      title={`Marking: ${transformedResult.assignment?.title || "Assignment"}`}
    >
      <div className="container mx-auto py-6 space-y-6">
        {/* Student Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>
              {transformedResult.student?.firstName || "Unknown"}{" "}
              {transformedResult.student?.lastName || "Student"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Submitted:</p>
                <p className="text-sm">
                  {transformedResult.dateTaken
                    ? format(
                        new Date(transformedResult.dateTaken),
                        "PPP 'at' p"
                      )
                    : "Unknown date"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Assignment Type:
                </p>
                <p className="text-sm">
                  {transformedResult.assignment?.type || "Unknown"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          {/* Left side - Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Questions</CardTitle>
              <CardDescription>
                Total Marks:{" "}
                {transformedResult.assignment?.questions?.reduce(
                  (acc, q) => acc + Number(q.mark),
                  0
                ) || 0}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {transformedResult.assignment?.questions?.map(
                (question, index) => (
                  <div key={question.id} className="border p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-bold">Question {index + 1}</h3>
                      <span className="text-sm text-muted-foreground">
                        {question.mark} marks
                      </span>
                    </div>
                    <p className="mb-4">{question.text}</p>
                    {question.options && question.options.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">
                          {question.type === "multiple"
                            ? "Options:"
                            : "Matches:"}
                        </h4>
                        <div className="ml-4">
                          {question.options.map((option) => (
                            <div
                              key={option.id}
                              className="text-sm text-muted-foreground"
                            >
                              {option.value ||
                                `${option.columnA} → ${option.columnB}`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </CardContent>
          </Card>

          {/* Right side - Student Answers */}
          <Card>
            <CardHeader>
              <CardTitle>Student Answers</CardTitle>
              <CardDescription>Assign marks for each answer</CardDescription>
            </CardHeader>
            <CardContent>
              {parsedAnswers.length > 0 ? (
                parsedAnswers.map((answer, index) => {
                  console.log(`Rendering answer ${index}:`, answer);
                  const question =
                    transformedResult.assignment?.questions?.[index];

                  if (!question) {
                    console.error(`No question found for index ${index}`);
                    return null;
                  }

                  return (
                    <div key={index} className="mb-6 p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold">Question {index + 1}</h3>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max={question?.mark}
                            placeholder="Score"
                            className="w-20"
                            value={scores[question.id] || ""}
                            onChange={(e) =>
                              handleScoreChange(question.id, e.target.value)
                            }
                          />
                          <span className="text-sm text-muted-foreground">
                            / {question?.mark}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm whitespace-pre-wrap">
                          {answer.answer}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-6 text-muted-foreground">
                  No answers available
                </div>
              )}

              <div className="mt-6 pt-4 border-t flex justify-between items-center">
                <div className="text-lg font-bold">
                  Total Score:{" "}
                  {Object.values(scores).reduce((a, b) => a + b, 0)} /{" "}
                  {transformedResult.assignment?.questions?.reduce(
                    (acc, q) => acc + Number(q.mark),
                    0
                  ) || 0}
                </div>
                <Button onClick={handleSubmitScores} variant="default">
                  Submit Marks
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ContentLayout>
  );
}
