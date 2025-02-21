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
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [tabHiddenTime, setTabHiddenTime] = useState<number | null>(null);
  const [windowFocused, setWindowFocused] = useState(true);
  const [blurStartTime, setBlurStartTime] = useState<number | null>(null);
  const TAB_HIDDEN_LIMIT = 10000; // 10 seconds in milliseconds
  const BLUR_TIME_LIMIT = 10000; // 10 seconds in milliseconds
  let autoSubmitTimeout: NodeJS.Timeout;

  useEffect(() => {
    console.log("🚀 Loading assignment test page...");
    loadAssignment();
  }, []);

  // Original tab visibility effect
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
            toast({
              title: "Test Auto-Submitted",
              description:
                "Test was automatically submitted due to leaving the page for too long",
              variant: "destructive",
            });
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
  }, [tabHiddenTime]);

  // New window focus detection effect
  useEffect(() => {
    const handleWindowBlur = () => {
      setWindowFocused(false);
      setBlurStartTime(Date.now());

      toast({
        title: "⚠️ Warning",
        description:
          "Opening another window will result in automatic submission after 10 seconds",
        variant: "destructive",
      });

      // Set timeout for auto-submission
      autoSubmitTimeout = setTimeout(async () => {
        try {
          // Force submit and redirect
          await handleSubmitTest();
          // Additional force redirect
          window.location.href = "/student/assignments";
        } catch (error) {
          // Ensure redirect happens even on error
          window.location.href = "/student/assignments";
        }
      }, BLUR_TIME_LIMIT);
    };

    const handleWindowFocus = () => {
      setWindowFocused(true);

      if (blurStartTime) {
        const timeAway = Date.now() - blurStartTime;
        if (timeAway < BLUR_TIME_LIMIT) {
          // Clear the auto-submit timeout if they return in time
          clearTimeout(autoSubmitTimeout);
          toast({
            title: "Welcome Back",
            description: "You've returned to the test window in time.",
            variant: "success",
          });
        }
      }

      setBlurStartTime(null);
    };

    // Add event listeners for window focus/blur
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    // Cleanup
    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      clearTimeout(autoSubmitTimeout);
    };
  }, []);
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (!assignment) return;
    e.preventDefault();
    e.returnValue = "";
  };

  // Security measures effect
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Prevent common keyboard shortcuts
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "c" || // Copy
          e.key === "v" || // Paste
          e.key === "p" || // Print
          e.key === "a" || // Select all
          e.key === "f" || // Find
          e.key === "s" || // Save
          e.key === "u" || // View source
          e.key === "o") // Open
      ) {
        e.preventDefault();
        toast({
          title: "Action Not Allowed",
          description: "This action is not permitted during the test",
          variant: "warning",
        });
        return false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Prevent right-click context menu
      return false;
    };

    const handleFocus = () => {
      // Check if the active element is part of the test
      const activeElement = document.activeElement;
      if (
        activeElement &&
        !activeElement.closest(".test-content") && // Add this class to your test container
        activeElement.tagName !== "BODY"
      ) {
        toast({
          title: "Warning",
          description: "Please stay focused on the test content",
          variant: "warning",
        });
        // Force focus back to the test
        (document.querySelector(".test-content") as HTMLElement)?.focus();
      }
    };

    // Add all event listeners
    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("focus", handleFocus, true);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Optional: Disable text selection
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("focus", handleFocus, true);
      window.removeEventListener("beforeunload", handleBeforeUnload);

      document.body.style.userSelect = "auto";
    };
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
      console.log("📝 Submitting test answers...");
      await submitAssignment(assignment.id, answers);

      // Remove all event listeners that might prevent navigation
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.onbeforeunload = null;
      clearTimeout(autoSubmitTimeout);

      console.log("✅ Test submitted successfully");

      // Force immediate redirect
      const redirectToAssignments = () => {
        router.replace("/student/assignments");
        // Fallback redirect
        setTimeout(() => {
          window.location.href = "/student/assignments";
        }, 100);
      };

      redirectToAssignments();
    } catch (error) {
      console.error("❌ Failed to submit test:", error);
      // Even on error, remove event listeners and redirect
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.onbeforeunload = null;
      router.replace("/student/assignments");
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
      <div
        className="container mx-auto py-6 space-y-6 test-content"
        tabIndex={-1}
      >
        {/* Warning Card */}
        <Card className="bg-warning/10 border-warning">
          <CardContent className="py-4">
            <p className="text-sm text-warning font-medium">
              ⚠️ Warning: Leaving this page or opening another window will
              result in automatic submission after 10 seconds
            </p>
          </CardContent>
        </Card>

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
