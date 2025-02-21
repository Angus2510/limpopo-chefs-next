"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentLayout } from "@/components/layout/content-layout";
import { format } from "date-fns";
import { getAssignmentById } from "@/lib/actions/assignments/getAssignmentById";
import { submitAssignment } from "@/lib/actions/assignments/assignmentSubmission";

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

interface Assignment {
  id: string;
  title: string;
  type: string;
  duration: number;
  availableFrom: Date;
  questions: Question[];
}

interface Answer {
  questionId: string;
  answer: string | { [key: string]: string };
}

export default function AssignmentTestPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    console.log("🚀 Loading assignment test page...");
    loadAssignment();
  }, []);

  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const loadAssignment = async () => {
    try {
      console.log("📚 Fetching assignment details...");
      const data = await getAssignmentById(params.id);
      setAssignment(data);
      setTimeRemaining(data.duration * 60); // Convert minutes to seconds

      // Initialize answers array
      const initialAnswers = data.questions.map((q) => ({
        questionId: q.id,
        answer: q.type === "matching" ? {} : "",
      }));
      setAnswers(initialAnswers);

      console.log("✅ Assignment loaded successfully");
    } catch (error) {
      console.error("❌ Failed to load assignment:", error);
      toast({
        title: "Error",
        description: "Could not load assignment",
        variant: "destructive",
      });
      router.push("/student/assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (
    questionId: string,
    value: string | { [key: string]: string }
  ) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.questionId === questionId ? { ...a, answer: value } : a
      )
    );
  };

  const handleSubmitTest = async () => {
    if (!assignment) return;

    try {
      console.log("📝 Submitting test answers...", {
        assignmentId: assignment.id,
        answerCount: answers.length,
      });

      await submitAssignment(assignment.id, answers);
      console.log("✅ Test submitted successfully");

      toast({
        title: "Success",
        description: "Test submitted successfully",
      });
      router.push("/student/assignments");
    } catch (error) {
      console.error("❌ Failed to submit test:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to submit test",
        variant: "destructive",
      });
    }
  };

  const renderQuestion = (question: Question) => {
    const currentAnswer = answers.find(
      (a) => a.questionId === question.id
    )?.answer;

    switch (question.type) {
      case "multiple":
        return (
          <div className="space-y-2">
            {question.options.map((option) => (
              <label key={option.id} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={currentAnswer === option.value}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                  className="h-4 w-4"
                />
                <span>{option.value}</span>
              </label>
            ))}
          </div>
        );

      case "matching":
        return (
          <div className="grid grid-cols-2 gap-4">
            {question.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <span className="font-medium">{option.columnA}</span>
                <select
                  value={
                    (currentAnswer as { [key: string]: string })?.[
                      option.columnA!
                    ] || ""
                  }
                  onChange={(e) => {
                    const newAnswer = {
                      ...(currentAnswer as { [key: string]: string }),
                      [option.columnA!]: e.target.value,
                    };
                    handleAnswerChange(question.id, newAnswer);
                  }}
                  className="border rounded p-1"
                >
                  <option value="">Select answer</option>
                  {question.options.map((opt) => (
                    <option key={opt.columnB} value={opt.columnB}>
                      {opt.columnB}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <textarea
            value={currentAnswer as string}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full h-32 p-2 border rounded"
            placeholder="Enter your answer here..."
          />
        );
    }
  };

  if (loading) {
    return (
      <ContentLayout title="Loading...">
        <div className="flex justify-center items-center h-48">
          Loading test...
        </div>
      </ContentLayout>
    );
  }

  if (!assignment) return null;

  return (
    <ContentLayout title={assignment.title}>
      <div className="container mx-auto py-6 space-y-6">
        {/* Timer Card */}
        <Card className="bg-primary/5">
          <CardContent className="py-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Time Remaining:</p>
                <p className="text-2xl font-bold">
                  {Math.floor(timeRemaining / 60)}:
                  {(timeRemaining % 60).toString().padStart(2, "0")}
                </p>
              </div>
              <Button onClick={handleSubmitTest} variant="destructive">
                Submit Test
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        {assignment.questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>Question {index + 1}</span>
                <span className="text-sm text-muted-foreground">
                  {question.mark} marks
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">{question.text}</p>
              {renderQuestion(question)}
            </CardContent>
          </Card>
        ))}
      </div>
    </ContentLayout>
  );
}
