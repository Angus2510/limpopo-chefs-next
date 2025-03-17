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

// Define strict types for question types to match database
type QuestionType =
  | "SingleWord"
  | "Short"
  | "Long"
  | "Multiple Choice"
  | "True/False";

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  mark: string;
  options: {
    id: string;
    value: string;
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
  answer: string;
}

const BLUR_TIME_LIMIT = 10000; // 10 seconds
const MAX_BLUR_COUNT = 3;

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
  const [blurCount, setBlurCount] = useState(0);
  const [blurStartTime, setBlurStartTime] = useState<number | null>(null);
  const [windowFocused, setWindowFocused] = useState(true);

  // Anti-cheat props for inputs/textareas
  const preventCheatingProps = {
    onCopy: (e: React.ClipboardEvent) => e.preventDefault(),
    onPaste: (e: React.ClipboardEvent) => e.preventDefault(),
    onCut: (e: React.ClipboardEvent) => e.preventDefault(),
    autoComplete: "off",
    autoCorrect: "off",
    autoCapitalize: "off",
    spellCheck: false,
  } as const;

  const loadAssignment = async () => {
    try {
      console.log("🔄 Loading assignment...");
      const data = await getAssignmentById(params.id);

      if (!data || !data.questions) {
        throw new Error("Invalid assignment data");
      }

      setAssignment(data);
      setTimeRemaining(data.duration * 60);

      const initialAnswers = data.questions.map((q) => ({
        questionId: q.id,
        answer: "",
      }));

      setAnswers(initialAnswers);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error loading assignment:", error);
      toast({
        title: "Error",
        description: "Failed to load assignment",
        variant: "destructive",
      });
      router.push("/student/assignments");
    }
  };

  const renderQuestion = (question: Question) => {
    const currentAnswer =
      answers.find((a) => a.questionId === question.id)?.answer || "";

    switch (question.type) {
      case "SingleWord":
        return (
          <div className="p-4 border rounded-lg">
            <input
              type="text"
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="w-full p-4 rounded-lg border"
              placeholder="Type single word answer..."
              {...preventCheatingProps}
            />
          </div>
        );

      case "Multiple Choice":
        return (
          <div className="space-y-4 p-4 border rounded-lg">
            {question.options.map((option) => (
              <label
                key={option.id}
                className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent cursor-pointer"
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.value}
                  checked={currentAnswer === option.value}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                  className="h-5 w-5 border-gray-300"
                  {...preventCheatingProps}
                />
                <span>{option.value}</span>
              </label>
            ))}
          </div>
        );

      case "True/False":
        return (
          <div className="space-y-4 p-4 border rounded-lg">
            {["True", "False"].map((value) => (
              <label
                key={value}
                className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent cursor-pointer"
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={value}
                  checked={currentAnswer === value}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                  className="h-5 w-5 border-gray-300"
                  {...preventCheatingProps}
                />
                <span>{value}</span>
              </label>
            ))}
          </div>
        );

      case "Short":
        return (
          <div className="p-4 border rounded-lg">
            <textarea
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="w-full min-h-[100px] p-4 rounded-lg border resize-none"
              placeholder="Type your answer here..."
              rows={3}
              {...preventCheatingProps}
            />
          </div>
        );

      case "Long":
        return (
          <div className="p-4 border rounded-lg">
            <textarea
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="w-full min-h-[200px] p-4 rounded-lg border resize-none"
              placeholder="Type your detailed answer here..."
              rows={6}
              {...preventCheatingProps}
            />
          </div>
        );

      default:
        console.error(`❌ Unknown question type: ${question.type}`);
        return (
          <div className="p-4 border rounded-lg bg-red-50 text-red-600">
            Error: Unknown question type ({question.type})
          </div>
        );
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.questionId === questionId ? { ...a, answer: value } : a
      )
    );
  };

  const handleSubmitTest = async () => {
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
        description: "Failed to submit test",
      });
    }
  };

  // Load assignment on mount
  useEffect(() => {
    loadAssignment();

    // Prevent right-click
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast({
        title: "Warning",
        description: "Right-click is disabled during the test",
        variant: "destructive",
      });
    };

    // Prevent keyboard shortcuts
    const preventShortcuts = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === "c" || e.key === "v" || e.key === "a")) ||
        (e.altKey && e.key === "Tab") ||
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I")
      ) {
        e.preventDefault();
        toast({
          title: "Warning",
          description: "Keyboard shortcuts are disabled during the test",
          variant: "destructive",
        });
      }
    };

    window.addEventListener("contextmenu", preventContextMenu);
    window.addEventListener("keydown", preventShortcuts);

    return () => {
      window.removeEventListener("contextmenu", preventContextMenu);
      window.removeEventListener("keydown", preventShortcuts);
    };
  }, []);

  // Timer effect
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

  // Tab visibility and window focus effects
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabVisible(false);
        setTabHiddenTime(Date.now());
        setBlurCount((prev) => prev + 1);

        toast({
          title: "Warning",
          description: `Window unfocused! Test will submit in 10 seconds. Warning ${
            blurCount + 1
          }/${MAX_BLUR_COUNT}`,
          variant: "destructive",
        });

        if (blurCount >= MAX_BLUR_COUNT - 1) {
          handleSubmitTest();
        }
      } else {
        setIsTabVisible(true);
        if (tabHiddenTime && Date.now() - tabHiddenTime > BLUR_TIME_LIMIT) {
          handleSubmitTest();
        }
        setTabHiddenTime(null);
      }
    };

    const handleBlur = () => {
      setWindowFocused(false);
      setBlurStartTime(Date.now());
      toast({
        title: "Warning",
        description: "Window unfocused! Return within 10 seconds.",
        variant: "destructive",
      });
    };

    const handleFocus = () => {
      setWindowFocused(true);
      if (blurStartTime && Date.now() - blurStartTime > BLUR_TIME_LIMIT) {
        handleSubmitTest();
      }
      setBlurStartTime(null);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [blurCount, tabHiddenTime, blurStartTime]);

  if (loading) {
    return (
      <ContentLayout title="Loading...">
        <div className="flex justify-center items-center h-48">
          <p className="text-lg">Loading test...</p>
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

      <div className="container mx-auto py-6 space-y-6">
        <Card className="bg-warning/10 border-warning">
          <CardContent className="py-4">
            <p className="text-sm text-warning font-medium">
              ⚠️ Warning: Leaving this page or switching tabs will result in
              automatic submission
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
          <Card key={question.id} className="shadow-lg">
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

        <div className="flex flex-col items-center gap-4 py-8">
          <Button
            onClick={handleSubmitTest}
            size="lg"
            variant="destructive"
            className="w-full max-w-md"
          >
            Submit Test
          </Button>
          <p className="text-lg font-bold">---END OF TEST---</p>
        </div>
      </div>
    </ContentLayout>
  );
}
