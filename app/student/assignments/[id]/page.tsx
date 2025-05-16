"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { ContentLayout } from "@/components/layout/content-layout";
import { getAssignmentById } from "@/lib/actions/assignments/getAssignmentById";
import { submitAssignment } from "@/lib/actions/assignments/assignmentSubmission";
import { RulesDialog } from "@/components/dialogs/assignments/RulesDialog";
import { QuestionNavigation } from "@/components/assignments/QuestionNavigation/QuestionNavigation";
import { QuestionView } from "@/components/assignments/QuestionView/QuestionView";
import { TestHeader } from "@/components/assignments/TestHeader/TestHeader";
import { TestControls } from "@/components/assignments/TestControls/TestControls";
import { usePasswordValidation } from "@/hooks/usePasswordValidation";
import { Card, CardContent } from "@/components/ui/card";
import {
  Assignment,
  Question,
  QuestionState,
  Answer,
} from "@/types/assignments/assignments";
import { use } from "react";

const requestFullScreen = () => {
  try {
    const element = document.documentElement;
    // Check if on iOS (iPad)
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (isIOS) {
      // iOS doesn't support true fullscreen - show a message instead
      toast({
        title: "Full Screen Limitation",
        description: "Please keep this tab open and visible during the test.",
      });
      return; // Exit early for iOS devices
    }

    // For other browsers, try standard fullscreen
    if (element.requestFullscreen) {
      element
        .requestFullscreen()
        .catch((err) => console.log("Fullscreen error:", err));
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen();
    } else if ((element as any).mozRequestFullScreen) {
      (element as any).mozRequestFullScreen();
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen();
    }
    console.log("Fullscreen requested");
  } catch (error) {
    console.error("Fullscreen API error:", error);
  }
};

const exitFullScreen = () => {
  try {
    // Check if we're actually in fullscreen mode before attempting to exit
    if (
      !document.fullscreenElement &&
      !(document as any).webkitFullscreenElement &&
      !(document as any).mozFullScreenElement
    ) {
      return; // Not in fullscreen, no need to exit
    }

    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
  } catch (error) {
    console.error("Exit fullscreen error:", error);
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

  // Base states
  const [showRules, setShowRules] = useState(true);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [testStarted, setTestStarted] = useState(false);

  // Navigation states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);

  // Security states
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [tabHiddenTime, setTabHiddenTime] = useState<number | null>(null);
  const [windowFocused, setWindowFocused] = useState(true);
  const [blurStartTime, setBlurStartTime] = useState<number | null>(null);
  const [warningShown, setWarningShown] = useState(false);

  // Constants
  const TAB_HIDDEN_LIMIT = 10000; // 10 seconds
  const BLUR_TIME_LIMIT = 10000; // 10 seconds
  const WARNING_DELAY = 5000; // 5 seconds warning before submission

  // Refs
  const timeRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleSubmitRef = useRef<() => Promise<void>>();
  const hasStartedRef = useRef(false);
  const isTestActiveRef = useRef(false);
  const answersRef = useRef<Answer[]>([]);

  const isPasswordValid = usePasswordValidation(resolvedParams.id);

  const showWarningToast = useCallback(() => {
    if (!warningShown) {
      setWarningShown(true);
      toast({
        title: "Warning",
        description:
          "Test will be submitted in 5 seconds if you don't return to the test window",
        variant: "destructive",
      });
    }
  }, [toast, warningShown]);

  const preventCopyPaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      toast({
        title: "Not Allowed",
        description: "Copy and paste are not allowed during the test",
        variant: "destructive",
      });
      return false;
    },
    [toast]
  );

  const handleAnswerChange = useCallback(
    (questionId: string, value: string) => {
      // Track the time spent on this question
      const now = Date.now();
      const timeSpent = startTimeRef.current ? now - startTimeRef.current : 0;

      setAnswers((prev) => {
        // Find the answer to update
        const answerExists = prev.some((a) => a.questionId === questionId);

        let newAnswers;
        if (answerExists) {
          newAnswers = prev.map((a) =>
            a.questionId === questionId
              ? {
                  ...a,
                  answer: value,
                  timeSpent: (a.timeSpent || 0) + timeSpent,
                }
              : a
          );
        } else {
          // If the answer doesn't exist yet
          newAnswers = [...prev, { questionId, answer: value, timeSpent }];
        }

        // Update the ref immediately for direct access
        answersRef.current = newAnswers;
        return newAnswers;
      });

      setQuestionStates((prev) =>
        prev.map((state) =>
          state.id === questionId ? { ...state, isAnswered: true } : state
        )
      );

      // Reset start time for next tracking
      startTimeRef.current = now;
    },
    [] // Empty because we use ref values
  );
  const handleFlagQuestion = useCallback(() => {
    if (!assignment) return;
    const currentQuestionId = assignment.questions[currentQuestionIndex].id;

    setQuestionStates((prev) =>
      prev.map((state) =>
        state.id === currentQuestionId
          ? { ...state, isFlagged: !state.isFlagged }
          : state
      )
    );
  }, [currentQuestionIndex, assignment]);

  const handleSubmitTest = useCallback(async () => {
    if (!assignment) return;

    try {
      // Exit fullscreen before submission to prevent issues
      exitFullScreen();

      // Use the ref for the most up-to-date answers
      const finalAnswers = answersRef.current.map((answer) => ({
        questionId: answer.questionId,
        answer: answer.answer || "", // Ensure we have at least empty string
        timeSpent: answer.timeSpent || 0,
      }));

      console.log("Submitting answers:", finalAnswers);

      await submitAssignment(assignment.id, finalAnswers);

      toast({
        title: "Success",
        description: "Test submitted successfully!",
      });

      // Clean up state before navigation to avoid memory leaks
      setTestStarted(false);
      isTestActiveRef.current = false;

      router.push("/student/dashboard");
    } catch (error) {
      console.error("Error submitting test:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit test. Please try again.",
      });
    }
  }, [assignment, router, toast]); // Remove 'answers' from dependencies

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);

  const handleNextQuestion = useCallback(() => {
    if (assignment && currentQuestionIndex < assignment.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [currentQuestionIndex, assignment]);

  const handleStartTest = useCallback(() => {
    if (!assignment) return;

    setShowRules(false);
    requestFullScreen();
    setTestStarted(true);
    startTimeRef.current = Date.now();
    isTestActiveRef.current = true;
    hasStartedRef.current = true;
    setTimeRemaining(assignment.duration * 60);
    handleSubmitRef.current = handleSubmitTest;

    // Initialize question states if not already done
    if (questionStates.length === 0) {
      setQuestionStates(
        assignment.questions.map((q) => ({
          id: q.id,
          isFlagged: false,
          isAnswered: false,
        }))
      );
    }

    // Initialize answers if not already done
    if (answers.length === 0) {
      const initialAnswers = assignment.questions.map((q) => ({
        questionId: q.id,
        answer: "",
      }));
      setAnswers(initialAnswers);
      answersRef.current = initialAnswers; // Initialize ref as well
    }
  }, [assignment, questionStates.length, answers.length, handleSubmitTest]);

  const loadAssignment = useCallback(async () => {
    if (!isPasswordValid) return;

    try {
      console.log("Loading assignment:", resolvedParams.id);
      const data = await getAssignmentById(resolvedParams.id);

      if (!data) {
        throw new Error("Assignment not found");
      }

      setAssignment(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load assignment:", error);
      toast({
        title: "Error",
        description: "Could not load assignment",
        variant: "destructive",
      });
      router.replace("/student/assignments");
    }
  }, [resolvedParams.id, router, toast, isPasswordValid]);

  // Initialize test
  useEffect(() => {
    if (!showRules && assignment && !testStarted) {
      handleStartTest();
    }
  }, [showRules, assignment, testStarted, handleStartTest]);

  // Timer effect
  useEffect(() => {
    if (!testStarted || !assignment) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          if (handleSubmitRef.current) {
            handleSubmitRef.current();
          }
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = timer;

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [testStarted, assignment]);

  // Password validation effect
  useEffect(() => {
    const checkAccess = async () => {
      if (!isPasswordValid && !loading) {
        toast({
          title: "Access Denied",
          description: "Invalid or missing test password",
          variant: "destructive",
        });
        router.replace("/student/assignments");
      }
    };

    checkAccess();
  }, [isPasswordValid, loading, router, toast]);

  // Load assignment effect
  useEffect(() => {
    if (isPasswordValid) {
      loadAssignment();
    }
  }, [isPasswordValid, loadAssignment]);

  // Tab visibility effect
  useEffect(() => {
    if (!testStarted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabVisible(false);
        setTabHiddenTime(Date.now());
        showWarningToast();

        // Set warning timer
        warningTimerRef.current = setTimeout(() => {
          if (document.hidden && handleSubmitRef.current) {
            handleSubmitRef.current();
          }
        }, WARNING_DELAY);
      } else {
        setIsTabVisible(true);
        setTabHiddenTime(null);
        setWarningShown(false);
        if (warningTimerRef.current) {
          clearTimeout(warningTimerRef.current);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
    };
  }, [testStarted, showWarningToast]);

  // Window focus effect
  useEffect(() => {
    if (!testStarted) return;

    // Check if on iOS/iPadOS
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    const handleFocus = () => {
      setWindowFocused(true);
      setWarningShown(false);
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
    };

    const handleBlur = () => {
      // For iOS/iPadOS Safari, be more lenient
      if (isIOS) {
        // Only show a gentle reminder without auto-submission
        toast({
          title: "Reminder",
          description: "Please keep this test window active",
          variant: "warning",
        });
        return;
      }

      setWindowFocused(false);
      showWarningToast();

      warningTimerRef.current = setTimeout(() => {
        if (!document.hasFocus() && handleSubmitRef.current) {
          handleSubmitRef.current();
        }
      }, WARNING_DELAY);
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
    };
  }, [testStarted, showWarningToast, toast]);

  // Navigation prevention effect
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isTestActiveRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Full screen effect
  useEffect(() => {
    if (!testStarted) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && hasStartedRef.current) {
        requestFullScreen();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [testStarted]);

  if (loading) {
    return (
      <ContentLayout title="Loading Test">
        <div className="flex flex-col justify-center items-center h-48 space-y-4">
          <div className="text-lg">Loading test content...</div>
          <div className="text-sm text-muted-foreground">
            Please wait while we prepare your test
          </div>
        </div>
      </ContentLayout>
    );
  }

  if (!assignment) return null;

  return (
    <ContentLayout title={assignment.title}>
      <RulesDialog
        open={showRules}
        onClose={handleStartTest}
        testInfo={{
          title: assignment.title,
          lecturer: assignment.lecturer || "Not specified",
          type: assignment.type,
          date: assignment.availableFrom,
          duration: assignment.duration,
        }}
      />

      {testStarted && (
        <div className="flex h-screen test-content" tabIndex={-1}>
          <div className="w-64 border-r">
            <QuestionNavigation
              questions={assignment.questions}
              currentIndex={currentQuestionIndex}
              questionStates={questionStates}
              onQuestionSelect={setCurrentQuestionIndex}
            />
          </div>

          <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
            <Card className="bg-warning/10 border-warning">
              <CardContent className="py-4">
                <div className="space-y-2">
                  <p className="text-sm text-warning font-medium">
                    ⚠️ Important Test Rules:
                  </p>
                  <ul className="text-sm text-warning list-disc pl-5 space-y-1">
                    <li>Leaving this page will trigger a warning</li>
                    <li>You have 5 seconds to return before auto-submission</li>
                    <li>Copy and paste are not allowed</li>
                    <li>Test must remain in fullscreen mode</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <TestHeader
              timeDisplay={timeRemaining}
              onSubmit={handleSubmitTest}
            />

            <QuestionView
              question={assignment.questions[currentQuestionIndex]}
              currentAnswer={
                answers.find(
                  (a) =>
                    a.questionId ===
                    assignment.questions[currentQuestionIndex].id
                )?.answer as string
              }
              onAnswerChange={handleAnswerChange}
              preventCopyPaste={preventCopyPaste}
            />

            <TestControls
              onPrevious={handlePreviousQuestion}
              onNext={handleNextQuestion}
              onFlag={handleFlagQuestion}
              isFirst={currentQuestionIndex === 0}
              isLast={currentQuestionIndex === assignment.questions.length - 1}
              isFlagged={
                questionStates[currentQuestionIndex]?.isFlagged || false
              }
            />
          </div>
        </div>
      )}
    </ContentLayout>
  );
}
