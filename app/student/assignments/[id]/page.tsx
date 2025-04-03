"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentLayout } from "@/components/layout/content-layout";
import { format } from "date-fns";
import { getAssignmentById } from "@/lib/actions/assignments/getAssignmentById";
import { submitAssignment } from "@/lib/actions/assignments/assignmentSubmission";
import { RulesDialog } from "@/components/dialogs/assignments/RulesDialog";
import { usePasswordValidation } from "@/hooks/usePasswordValidation";
import { use } from "react";

interface Question {
  id: string;
  text: string;
  type: "short-answer" | "long-answer" | "multiple-choice" | "true-false";
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
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const [showRules, setShowRules] = useState(true);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [tabHiddenTime, setTabHiddenTime] = useState<number | null>(null);
  const [windowFocused, setWindowFocused] = useState(true);
  const [blurStartTime, setBlurStartTime] = useState<number | null>(null);
  const [testStarted, setTestStarted] = useState(false); // Added new state
  const TAB_HIDDEN_LIMIT = 10000;
  const BLUR_TIME_LIMIT = 10000;
  const isPasswordValid = usePasswordValidation(resolvedParams.id);

  const handleSubmitTest = useCallback(async () => {
    if (!assignment) return;

    try {
      console.log("Submitting test with data:", {
        assignmentId: assignment.id,
        answers: answers,
        timeSpent: assignment.duration * 60 - timeRemaining,
      });

      await submitAssignment(assignment.id, answers);

      toast({
        title: "Success",
        description: "Test submitted successfully!",
      });

      router.push("/student/dashboard");
    } catch (error) {
      console.error("Error submitting test:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit test. Please try again.",
      });
    }
  }, [assignment, answers, timeRemaining, router, toast]);

  const handleAnswerChange = useCallback(
    (questionId: string, value: string | { [key: string]: string }) => {
      setAnswers((prev) =>
        prev.map((a) =>
          a.questionId === questionId ? { ...a, answer: value } : a
        )
      );
    },
    []
  );

  const loadAssignment = useCallback(async () => {
    try {
      console.log("📚 Fetching assignment details...");
      const data = await getAssignmentById(resolvedParams.id);
      setAssignment(data);

      const initialAnswers = data.questions.map((q) => ({
        questionId: q.id,
        answer: q.type === "multiple-choice" ? "" : "",
      }));
      setAnswers(initialAnswers);
      setLoading(false);
      // Remove setTestStarted from here since it's now handled in the password validation effect
    } catch (error) {
      console.error("❌ Failed to load assignment:", error);
      toast({
        title: "Error",
        description: "Could not load assignment",
        variant: "destructive",
      });
      router.push("/student/assignments");
    }
  }, [resolvedParams.id, router, toast]);

  const renderQuestion = useCallback(
    (question: Question) => {
      const currentAnswer = answers.find(
        (a) => a.questionId === question.id
      )?.answer;

      switch (question.type) {
        case "multiple-choice":
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
                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                  />
                  <span>{option.value}</span>
                </label>
              ))}
            </div>
          );

        case "true-false":
          return (
            <div className="space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name={question.id}
                  value="true"
                  checked={currentAnswer === "true"}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2">True</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name={question.id}
                  value="false"
                  checked={currentAnswer === "false"}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2">False</span>
              </label>
            </div>
          );

        case "short-answer":
        case "long-answer":
          return (
            <textarea
              value={currentAnswer as string}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your answer here..."
              rows={question.type === "long-answer" ? 6 : 2}
            />
          );

        default:
          return null;
      }
    },
    [answers, handleAnswerChange]
  );

  useEffect(() => {
    loadAssignment();
  }, [loadAssignment]);

  // Modified password validation useEffect
  useEffect(() => {
    if (isPasswordValid && !testStarted) {
      setTestStarted(true);
    }
  }, [isPasswordValid, testStarted]);

  // Modified timer useEffect
  // Replace the existing timer useEffect with this version
  useEffect(() => {
    // Only start timer if test has started and we have an assignment
    if (testStarted && assignment) {
      // Initialize timer only once when starting
      if (timeRemaining === 0) {
        setTimeRemaining(assignment.duration * 60);
      }

      // Create timer that runs independently of other state changes
      const timer = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            clearInterval(timer);
            handleSubmitTest();
            return 0;
          }
          return time - 1;
        });
      }, 1000);

      // Cleanup timer
      return () => clearInterval(timer);
    }
  }, [testStarted, assignment, handleSubmitTest]); // Removed timeRemaining and loading from dependencies

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabVisible(false);
        setTabHiddenTime(Date.now());
        toast({
          title: "Warning",
          description:
            "Leaving the test page will result in automatic submission after 10 seconds",
          variant: "destructive",
        });
      } else {
        setIsTabVisible(true);
        if (tabHiddenTime) {
          const timeHidden = Date.now() - tabHiddenTime;
          if (timeHidden > TAB_HIDDEN_LIMIT) {
            handleSubmitTest();
          }
        }
        setTabHiddenTime(null);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [tabHiddenTime, handleSubmitTest, toast]);

  useEffect(() => {
    const handleBlur = () => {
      setWindowFocused(false);
      setBlurStartTime(Date.now());
      toast({
        title: "Warning",
        description:
          "Test will auto-submit if you don't return within 10 seconds",
        variant: "destructive",
      });
    };

    const handleFocus = () => {
      setWindowFocused(true);
      if (blurStartTime) {
        const timeUnfocused = Date.now() - blurStartTime;
        if (timeUnfocused > BLUR_TIME_LIMIT) {
          handleSubmitTest();
        }
      }
      setBlurStartTime(null);
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [blurStartTime, handleSubmitTest, toast]);

  const renderedQuestions = useMemo(() => {
    return assignment?.questions.map((question, index) => (
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
    ));
  }, [assignment?.questions, renderQuestion]);

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
      <RulesDialog
        open={showRules}
        onClose={() => setShowRules(false)}
        testInfo={{
          title: assignment.title,
          lecturer: "Jim",
          type: assignment.type,
          date: assignment.availableFrom,
          duration: assignment.duration,
        }}
      />

      <div
        className="container mx-auto py-6 space-y-6 test-content"
        tabIndex={-1}
      >
        <Card className="bg-warning/10 border-warning">
          <CardContent className="py-4">
            <p className="text-sm text-warning font-medium">
              ⚠️ Warning: Leaving this page or opening another window will
              result in automatic submission after 10 seconds
            </p>
          </CardContent>
        </Card>

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

        {renderedQuestions}

        <div className="flex flex-col items-center justify-center py-8">
          <Button
            onClick={handleSubmitTest}
            variant="destructive"
            className="mb-4"
          >
            Submit Test
          </Button>
          <h1 className="text-lg font-bold">---END OF TEST---</h1>
        </div>
      </div>
    </ContentLayout>
  );
}
