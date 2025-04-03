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

const requestFullScreen = () => {
  const element = document.documentElement;
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if ((element as any).webkitRequestFullscreen) {
    (element as any).webkitRequestFullscreen();
  } else if ((element as any).mozRequestFullScreen) {
    (element as any).mozRequestFullScreen();
  } else if ((element as any).msRequestFullscreen) {
    (element as any).msRequestFullscreen();
  }
};

const exitFullScreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if ((document as any).webkitExitFullscreen) {
    (document as any).webkitExitFullscreen();
  } else if ((document as any).mozCancelFullScreen) {
    (document as any).mozCancelFullScreen();
  } else if ((document as any).msExitFullscreen) {
    (document as any).msExitFullscreen();
  }
};

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
  const [testStarted, setTestStarted] = useState(false);
  const TAB_HIDDEN_LIMIT = 10000;
  const BLUR_TIME_LIMIT = 10000;
  const isPasswordValid = usePasswordValidation(resolvedParams.id);

  // Timer and refs
  const [timeDisplay, setTimeDisplay] = useState(0);
  const timeRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const handleSubmitRef = useRef<() => Promise<void>>();
  const hasStartedRef = useRef(false);
  const isTestActiveRef = useRef(false);

  const preventCopyPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    return false;
  };

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

  // Load assignment effect
  useEffect(() => {
    loadAssignment();
  }, [loadAssignment]);

  // Password validation effect with localStorage
  useEffect(() => {
    if (isPasswordValid && !testStarted) {
      const testStatus = localStorage.getItem(
        `test_started_${resolvedParams.id}`
      );
      if (testStatus === "true" || hasStartedRef.current) {
        router.push("/student/dashboard");
        toast({
          title: "Access Denied",
          description:
            "You cannot rejoin a test that has already been started.",
          variant: "destructive",
        });
        return;
      }
      hasStartedRef.current = true;
      localStorage.setItem(`test_started_${resolvedParams.id}`, "true");
      setTestStarted(true);
      isTestActiveRef.current = true;
    }
  }, [isPasswordValid, testStarted, router, toast, resolvedParams.id]);

  // Timer effect
  useEffect(() => {
    handleSubmitRef.current = handleSubmitTest;

    if (testStarted && assignment) {
      // Initialize timer only once when test starts
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
        timeRef.current = assignment.duration * 60;
        setTimeDisplay(timeRef.current);
      }

      // Use performance.now() for more accurate timing
      const timer = setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = Math.floor(
          (currentTime - startTimeRef.current!) / 1000
        );
        const remainingTime = Math.max(
          0,
          assignment.duration * 60 - elapsedTime
        );

        setTimeDisplay(remainingTime);

        if (remainingTime <= 0) {
          clearInterval(timer);
          handleSubmitRef.current?.();
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [testStarted, assignment]);

  useEffect(() => {
    if (testStarted && assignment) {
      // Request full screen when test starts
      requestFullScreen();

      // Attempt to prevent screenshots
      const style = document.createElement("style");
      style.innerHTML = `
        .test-content {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
        }
        video::-webkit-media-controls-enclosure,
        video::-webkit-media-controls {
          display: none !important;
        }
      `;
      document.head.appendChild(style);

      // Handle full screen change
      const handleFullScreenChange = () => {
        if (!document.fullscreenElement) {
          requestFullScreen();
          toast({
            title: "Warning",
            description: "Full screen mode is required for this test",
            variant: "destructive",
          });
        }
      };

      document.addEventListener("fullscreenchange", handleFullScreenChange);
      document.addEventListener(
        "webkitfullscreenchange",
        handleFullScreenChange
      );
      document.addEventListener("mozfullscreenchange", handleFullScreenChange);
      document.addEventListener("MSFullscreenChange", handleFullScreenChange);

      return () => {
        document.removeEventListener(
          "fullscreenchange",
          handleFullScreenChange
        );
        document.removeEventListener(
          "webkitfullscreenchange",
          handleFullScreenChange
        );
        document.removeEventListener(
          "mozfullscreenchange",
          handleFullScreenChange
        );
        document.removeEventListener(
          "MSFullscreenChange",
          handleFullScreenChange
        );
        exitFullScreen();
        document.head.removeChild(style);
      };
    }
  }, [testStarted, assignment, toast]);

  // Add this effect near your other useEffect hooks
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => {
      if (isTestActiveRef.current) {
        e.preventDefault();
        return false;
      }
    };

    const preventKeyboardShortcuts = (e: KeyboardEvent) => {
      if (isTestActiveRef.current) {
        if (
          (e.ctrlKey || e.metaKey) &&
          (e.key === "c" || e.key === "v" || e.key === "x")
        ) {
          e.preventDefault();
          return false;
        }
      }
    };

    window.addEventListener("contextmenu", preventContextMenu);
    window.addEventListener("keydown", preventKeyboardShortcuts);

    return () => {
      window.removeEventListener("contextmenu", preventContextMenu);
      window.removeEventListener("keydown", preventKeyboardShortcuts);
    };
  }, []);

  // Tab visibility effect
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!isTestActiveRef.current) return;

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
            handleSubmitRef.current?.();
          }
        }
        setTabHiddenTime(null);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [tabHiddenTime, toast]);

  // Window blur/focus effect
  useEffect(() => {
    const handleBlur = () => {
      if (!isTestActiveRef.current) return;

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
      if (!isTestActiveRef.current) return;

      setWindowFocused(true);
      if (blurStartTime) {
        const timeUnfocused = Date.now() - blurStartTime;
        if (timeUnfocused > BLUR_TIME_LIMIT) {
          handleSubmitRef.current?.();
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
  }, [blurStartTime, toast]);

  // Navigation prevention effect
  useEffect(() => {
    const preventNavigation = (e: PopStateEvent) => {
      if (isTestActiveRef.current) {
        e.preventDefault();
        history.pushState(null, "", location.href);
        toast({
          title: "Warning",
          description: "Navigation is disabled during the test",
          variant: "destructive",
        });
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isTestActiveRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    if (testStarted) {
      window.history.pushState(null, "", location.href);
      window.addEventListener("popstate", preventNavigation);
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("popstate", preventNavigation);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [testStarted, toast]);

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
              onCopy={preventCopyPaste}
              onPaste={preventCopyPaste}
              onCut={preventCopyPaste}
              autoComplete="off"
              spellCheck="false"
              data-form-type="other"
            />
          );

        default:
          return null;
      }
    },
    [answers, handleAnswerChange]
  );

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
                  {Math.floor(timeDisplay / 60)}:
                  {(timeDisplay % 60).toString().padStart(2, "0")}
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
