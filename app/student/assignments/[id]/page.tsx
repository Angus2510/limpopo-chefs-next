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
  type: "multiple" | "truefalse" | "short" | "long" | "matching";
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
  const TAB_HIDDEN_LIMIT = 10000;
  const BLUR_TIME_LIMIT = 10000;
  let autoSubmitTimeout: NodeJS.Timeout;

  useEffect(() => {
    console.log("🚀 Loading assignment test page...");
    loadAssignment();
  }, []);

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

      autoSubmitTimeout = setTimeout(async () => {
        try {
          await handleSubmitTest();
          window.location.href = "/student/assignments";
        } catch (error) {
          window.location.href = "/student/assignments";
        }
      }, BLUR_TIME_LIMIT);
    };

    const handleWindowFocus = () => {
      setWindowFocused(true);

      if (blurStartTime) {
        const timeAway = Date.now() - blurStartTime;
        if (timeAway < BLUR_TIME_LIMIT) {
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

    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

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

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "c" ||
          e.key === "v" ||
          e.key === "p" ||
          e.key === "a" ||
          e.key === "f" ||
          e.key === "s" ||
          e.key === "u" ||
          e.key === "o")
      ) {
        toast({
          title: "Warning",
          description:
            "Using keyboard shortcuts during a test is not recommended",
          variant: "warning",
        });
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      toast({
        title: "Warning",
        description: "Using right-click menu during a test is not recommended",
        variant: "warning",
      });
    };

    const handleFocus = () => {
      const activeElement = document.activeElement;
      if (
        activeElement &&
        !activeElement.closest(".test-content") &&
        activeElement.tagName !== "BODY"
      ) {
        toast({
          title: "Warning",
          description: "Please stay focused on the test content",
          variant: "warning",
        });
      }
    };

    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("focus", handleFocus, true);
    window.addEventListener("beforeunload", handleBeforeUnload);

    document.body.style.userSelect = "text";

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("focus", handleFocus, true);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

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
      setTimeRemaining(data.duration * 60);

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

    // Add confirmation dialog before proceeding
    if (
      !window.confirm(
        "Are you sure you want to submit your test? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      console.log("📝 Submitting test answers...");
      await submitAssignment(assignment.id, answers);

      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.onbeforeunload = null;
      clearTimeout(autoSubmitTimeout);

      console.log("✅ Test submitted successfully");

      const redirectToAssignments = () => {
        router.replace("/student/assignments");
        setTimeout(() => {
          window.location.href = "/student/assignments";
        }, 100);
      };

      redirectToAssignments();
    } catch (error) {
      console.error("❌ Failed to submit test:", error);
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
          <div className="space-y-3">
            {question.options.map((option) => (
              <label
                key={option.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={currentAnswer === option.value}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                  className="h-5 w-5"
                  autoComplete="off"
                />
                <span className="text-base">{option.value}</span>
              </label>
            ))}
          </div>
        );

      case "truefalse":
        return (
          <div className="space-y-3">
            <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
              <input
                type="radio"
                name={`question_${question.id}`}
                value="true"
                checked={currentAnswer === "true"}
                onChange={(e) =>
                  handleAnswerChange(question.id, e.target.value)
                }
                className="h-5 w-5"
                autoComplete="off"
              />
              <span className="text-base">True</span>
            </label>
            <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
              <input
                type="radio"
                name={`question_${question.id}`}
                value="false"
                checked={currentAnswer === "false"}
                onChange={(e) =>
                  handleAnswerChange(question.id, e.target.value)
                }
                className="h-5 w-5"
                autoComplete="off"
              />
              <span className="text-base">False</span>
            </label>
          </div>
        );

      case "short":
        return (
          <input
            type="text"
            value={currentAnswer as string}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="Enter your short answer here..."
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
          />
        );

      case "long":
        return (
          <textarea
            value={currentAnswer as string}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full h-32 p-2 border rounded-md"
            placeholder="Enter your detailed answer here..."
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
          />
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
                  className="flex-1 p-2 border rounded-md"
                  autoComplete="off"
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
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
            data-lpignore="true"
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
              <Button
                onClick={handleSubmitTest}
                variant="destructive"
                type="button"
              >
                Submit Test
              </Button>
            </div>
          </CardContent>
        </Card>

        <form
          onSubmit={(e) => e.preventDefault()}
          autoComplete="off"
          spellCheck="false"
          className="space-y-6"
        >
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
              type="button"
              className="mb-4"
            >
              Submit Test
            </Button>
            <h1 className="text-lg font-bold">---END OF TEST---</h1>
          </div>
        </form>
      </div>
    </ContentLayout>
  );
}
