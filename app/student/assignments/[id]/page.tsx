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
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (isIOS) {
      // toast({ // toast is not defined in this scope, consider passing it or using a global toast
      //   title: "Full Screen Limitation",
      //   description: "Please keep this tab open and visible during the test.",
      // });
      console.warn("Fullscreen not available on iOS. Showing reminder.");
      return;
    }

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
    if (
      !document.fullscreenElement &&
      !(document as any).webkitFullscreenElement &&
      !(document as any).mozFullScreenElement
    ) {
      return;
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

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

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
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
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
      const now = Date.now();
      const timeSpent = startTimeRef.current ? now - startTimeRef.current : 0;

      setAnswers((prev) => {
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
          newAnswers = [...prev, { questionId, answer: value, timeSpent }];
        }
        answersRef.current = newAnswers;

        if (assignment) {
          try {
            localStorage.setItem(
              `assignment_answers_${assignment.id}`,
              JSON.stringify(newAnswers)
            );
          } catch (error) {
            console.error("Error saving answers to localStorage:", error);
          }
        }
        return newAnswers;
      });

      setQuestionStates((prev) =>
        prev.map((state) =>
          state.id === questionId ? { ...state, isAnswered: true } : state
        )
      );
      startTimeRef.current = now;
    },
    [assignment]
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

  const performSaveAnswers = useCallback(
    async (isAutoSave = false) => {
      if (
        !assignment ||
        !answersRef.current ||
        answersRef.current.length === 0
      ) {
        if (!isAutoSave) console.log("No assignment or answers to save.");
        return false;
      }

      try {
        const finalAnswers = answersRef.current.map((answer) => ({
          questionId: answer.questionId,
          answer: answer.answer || "",
          timeSpent: answer.timeSpent || 0,
        }));

        // Pass isAutoSave to submitAssignment if your backend handles it
        await submitAssignment(assignment.id, finalAnswers /*, isAutoSave */);

        setLastSaved(new Date());
        if (!isAutoSave) {
          toast({
            title: "Success",
            description: "Test submitted successfully!",
          });
        } else {
          console.log(
            "Auto-save successful at",
            new Date().toLocaleTimeString()
          );
          // Optional: toast({ title: "Progress Saved", duration: 2000 });
        }
        return true;
      } catch (error) {
        console.error(
          `Error ${isAutoSave ? "auto-saving" : "submitting"} test:`,
          error
        );
        if (!isAutoSave) {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to ${
              isAutoSave ? "auto-save" : "submit"
            } test. Please try again.`,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Auto-save Failed",
            description: "Could not save progress. Will retry.",
            duration: 3000,
          });
        }
        return false;
      }
    },
    [assignment, toast]
  );

  const handleSubmitTest = useCallback(async () => {
    if (!assignment) return;
    exitFullScreen();

    const success = await performSaveAnswers(false);

    if (success) {
      try {
        localStorage.removeItem(`assignment_answers_${assignment.id}`);
      } catch (error) {
        console.error("Error removing answers from localStorage:", error);
      }

      setTestStarted(false);
      isTestActiveRef.current = false;
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
      router.push("/student/dashboard");
    }
  }, [assignment, router, performSaveAnswers]);

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

    let initialAnswers: Answer[] = [];
    let loadedQuestionStates = questionStates; // Keep existing flags if any

    try {
      const savedAnswersRaw = localStorage.getItem(
        `assignment_answers_${assignment.id}`
      );
      if (savedAnswersRaw) {
        const parsedAnswers = JSON.parse(savedAnswersRaw) as Answer[];
        if (
          Array.isArray(parsedAnswers) &&
          parsedAnswers.length === assignment.questions.length
        ) {
          initialAnswers = parsedAnswers;
          loadedQuestionStates = assignment.questions.map((q, index) => ({
            id: q.id,
            isFlagged: questionStates[index]?.isFlagged || false, // Preserve existing flags
            isAnswered: !!parsedAnswers.find(
              (a) => a.questionId === q.id && a.answer
            ),
          }));
          toast({
            title: "Progress Restored",
            description: "Your previous answers have been loaded.",
          });
        } else {
          localStorage.removeItem(`assignment_answers_${assignment.id}`);
        }
      }
    } catch (error) {
      console.error("Error loading answers from localStorage:", error);
      localStorage.removeItem(`assignment_answers_${assignment.id}`);
    }

    if (initialAnswers.length === 0) {
      initialAnswers = assignment.questions.map((q) => ({
        questionId: q.id,
        answer: "",
        timeSpent: 0,
      }));
      loadedQuestionStates = assignment.questions.map((q) => ({
        id: q.id,
        isFlagged: false,
        isAnswered: false,
      }));
    }

    setAnswers(initialAnswers);
    answersRef.current = initialAnswers;
    setQuestionStates(loadedQuestionStates);
  }, [assignment, handleSubmitTest, toast, questionStates]); // Added questionStates

  const loadAssignment = useCallback(async () => {
    if (!isPasswordValid) return;

    try {
      console.log("Loading assignment:", resolvedParams.id);
      const data = await getAssignmentById(resolvedParams.id);

      if (!data) {
        throw new Error("Assignment not found");
      }

      setAssignment(data);
      // Initialize questionStates here after assignment is loaded
      setQuestionStates(
        data.questions.map((q) => ({
          id: q.id,
          isFlagged: false,
          isAnswered: false,
        }))
      );
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

  // Auto-save effect
  useEffect(() => {
    if (testStarted && assignment) {
      autoSaveTimerRef.current = setInterval(() => {
        performSaveAnswers(true);
      }, AUTO_SAVE_INTERVAL);

      return () => {
        if (autoSaveTimerRef.current) {
          clearInterval(autoSaveTimerRef.current);
        }
      };
    }
  }, [testStarted, assignment, performSaveAnswers]);

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
      if (isIOS) {
        toast({
          title: "Reminder",
          description: "Please keep this test window active",
          variant: "warning", // Changed from destructive to warning for iOS reminder
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
        // Avoid calling requestFullScreen if it's iOS, as it doesn't have true fullscreen
        const isIOS =
          /iPad|iPhone|iPod/.test(navigator.userAgent) ||
          (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
        if (!isIOS) {
          requestFullScreen();
        }
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
                    <li>
                      Test must remain in fullscreen mode (where supported)
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <TestHeader
              timeDisplay={timeRemaining}
              onSubmit={handleSubmitTest}
              lastSaved={lastSaved} // Pass lastSaved to TestHeader
            />

            <QuestionView
              question={assignment.questions[currentQuestionIndex]}
              currentAnswer={
                answers.find(
                  (a) =>
                    a.questionId ===
                    assignment.questions[currentQuestionIndex].id
                )?.answer || "" // Ensure string, even if undefined
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
