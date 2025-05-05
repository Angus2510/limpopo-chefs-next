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

  // Constants
  const TAB_HIDDEN_LIMIT = 10000;
  const BLUR_TIME_LIMIT = 10000;

  // Refs
  const timeRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const handleSubmitRef = useRef<() => Promise<void>>();
  const hasStartedRef = useRef(false);
  const isTestActiveRef = useRef(false);

  const isPasswordValid = usePasswordValidation(resolvedParams.id);

  const preventCopyPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    return false;
  };

  const handleAnswerChange = useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) =>
        prev.map((a) =>
          a.questionId === questionId ? { ...a, answer: value } : a
        )
      );

      setQuestionStates((prev) =>
        prev.map((state) =>
          state.id === questionId ? { ...state, isAnswered: true } : state
        )
      );
    },
    []
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
  }, [assignment, answers, router, toast]);

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
      setAnswers(
        assignment.questions.map((q) => ({
          questionId: q.id,
          answer: "",
        }))
      );
    }
  }, [assignment, questionStates.length, answers.length, handleSubmitTest]);

  const loadAssignment = useCallback(async () => {
    try {
      const data = await getAssignmentById(resolvedParams.id);
      setAssignment(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load assignment:", error);
      toast({
        title: "Error",
        description: "Could not load assignment",
        variant: "destructive",
      });
      router.push("/student/assignments");
    }
  }, [resolvedParams.id, router, toast]);

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
  // Password validation effect
  useEffect(() => {
    const checkPassword = async () => {
      if (!isPasswordValid) {
        // Only redirect if we're not in the process of loading
        if (!loading) {
          toast({
            title: "Access Denied",
            description: "Invalid or missing test password",
            variant: "destructive",
          });
          router.push("/student/assignments");
        }
      }
    };

    checkPassword();
  }, [isPasswordValid, loading, router, toast]);

  // Load assignment effect - modify to check password first
  useEffect(() => {
    if (isPasswordValid) {
      loadAssignment();
    }
  }, [isPasswordValid, loadAssignment]);

  // Load assignment effect
  useEffect(() => {
    loadAssignment();
  }, [loadAssignment]);

  // Tab visibility effect
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabVisible(false);
        setTabHiddenTime(Date.now());
      } else {
        setIsTabVisible(true);
        if (tabHiddenTime && Date.now() - tabHiddenTime > TAB_HIDDEN_LIMIT) {
          if (handleSubmitRef.current) {
            handleSubmitRef.current();
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

  // Window focus effect
  useEffect(() => {
    const handleFocus = () => {
      setWindowFocused(true);
      if (blurStartTime && Date.now() - blurStartTime > BLUR_TIME_LIMIT) {
        if (handleSubmitRef.current) {
          handleSubmitRef.current();
        }
      }
      setBlurStartTime(null);
    };

    const handleBlur = () => {
      setWindowFocused(false);
      setBlurStartTime(Date.now());
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [blurStartTime]);

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
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && hasStartedRef.current) {
        requestFullScreen();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

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
          {/* Sidebar Navigation */}
          <div className="w-64 border-r">
            <QuestionNavigation
              questions={assignment.questions}
              currentIndex={currentQuestionIndex}
              questionStates={questionStates}
              onQuestionSelect={setCurrentQuestionIndex}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
            <Card className="bg-warning/10 border-warning">
              <CardContent className="py-4">
                <p className="text-sm text-warning font-medium">
                  ⚠️ Warning: Leaving this page or opening another window will
                  result in automatic submission after 10 seconds
                </p>
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
