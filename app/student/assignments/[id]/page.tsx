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
import { RulesDialog } from "@/components/dialogs/assignments/RulesDialog";
import { usePasswordValidation } from "@/hooks/usePasswordValidation";

interface Question {
  id: string;
  text: string;
  type: "short-answer" | "long-answer" | "multiple-choice" | "true-false"; // Update these types to match
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

  const [showRules, setShowRules] = useState(true);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [tabHiddenTime, setTabHiddenTime] = useState<number | null>(null);
  const [windowFocused, setWindowFocused] = useState(true);
  const [blurStartTime, setBlurStartTime] = useState<number | null>(null);
  const TAB_HIDDEN_LIMIT = 10000;
  const BLUR_TIME_LIMIT = 10000;
  let autoSubmitTimeout: NodeJS.Timeout;
  const isPasswordValid = usePasswordValidation(params.id);

  useEffect(() => {
    console.log("🚀 Loading assignment test page...");
    loadAssignment();
  }, []);

  useEffect(() => {
    if (!isPasswordValid) {
      handleSubmitTest();
    }
  }, [isPasswordValid]);

  useEffect(() => {
    if (!loading && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [loading, timeRemaining]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabVisible(false);
        setTabHiddenTime(Date.now());
        toast({
          title: "Warning",
          description:
            "Leaving the test page will result in automatic submission after 10 seconds",
          variant: "warning",
        });
      } else {
        setIsTabVisible(true);
        if (tabHiddenTime) {
          const timeHidden = Date.now() - tabHiddenTime;
          if (timeHidden > TAB_HIDDEN_LIMIT) {
            handleSubmitTest(); // This will now use the corrected submission function
          }
        }
        setTabHiddenTime(null);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [tabHiddenTime, assignment?.id]);

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
  }, [blurStartTime]);

  const loadAssignment = async () => {
    try {
      console.log("📚 Fetching assignment details...");
      const data = await getAssignmentById(params.id);
      console.log(
        "Loaded question types:",
        data.questions.map((q) => q.type)
      ); // Add this
      setAssignment(data);
      setTimeRemaining(data.duration * 60);

      const initialAnswers = data.questions.map((q) => ({
        questionId: q.id,
        answer: q.type === "multiple-choice" ? "" : "", // Changed from matching
      }));
      console.log("Initial answers:", initialAnswers); // Add this
      setAnswers(initialAnswers);
      setLoading(false);
    } catch (error) {
      console.error("❌ Failed to load assignment:", error);
      toast({
        title: "Error",
        description: "Could not load assignment",
        variant: "destructive",
      });
      router.push("/student/assignments");
    }
  };

  const handleSubmitTest = async () => {
    if (!assignment) return;

    try {
      console.log("Submitting test with data:", {
        assignmentId: assignment.id,
        answers: answers,
        timeSpent: assignment.duration * 60 - timeRemaining,
      });

      // Call submitAssignment with correct parameter structure
      await submitAssignment(
        assignment.id, // Pass assignmentId directly
        answers // Pass answers array directly
      );

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

  const renderQuestion = (question: Question) => {
    console.log("Rendering question:", question); // Add this debug log
    const currentAnswer = answers.find(
      (a) => a.questionId === question.id
    )?.answer;

    switch (question.type) {
      case "multiple-choice":
        console.log("Rendering multiple choice options:", question.options); // Add this
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
        console.log("Question type not handled:", question.type); // Add this
        return null;
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
