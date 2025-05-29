"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { submitScore } from "@/lib/actions/assignments/submitScore";

// Add this CSS at the top of your file
const noScrollInputStyles = `
  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type=number] {
    -moz-appearance: textfield;
  }
`;

interface Question {
  id: string;
  text: string;
  mark: string;
}

interface Answer {
  question: string;
  answer: any;
}

interface MarkAnswersProps {
  resultId: string;
  questions: Question[];
  parsedAnswers: Answer[];
  initialScores: Record<string, number>;
  totalPossible: number;
  staffId: string;
  studentId: string;
  groupId: string;
  mode?: "input" | "submit";
  onScoreChange?: () => void;
  filterParams?: {
    // Add this
    groupId: string;
    campusId: string;
    outcomeId: string;
    search: string;
    sort: string;
  };
}

// Create a custom event for score updates
if (typeof window !== "undefined") {
  window.markingScores = window.markingScores || {};
}

// Add to global types
declare global {
  interface Window {
    markingScores: Record<string, number>;
    updateTotalScore?: () => void; // Function to trigger total recalculation
  }
}

export function MarkAnswers({
  resultId,
  questions,
  parsedAnswers,
  initialScores,
  totalPossible,
  staffId,
  studentId,
  groupId,
  mode = "submit",
  onScoreChange,
  filterParams,
}: MarkAnswersProps) {
  // Initialize scores with empty values unless there are valid initial scores
  const [scores, setScores] = useState<Record<string, number>>(() => {
    // Only use initial scores if they exist and aren't empty
    const startingScores =
      initialScores && Object.keys(initialScores).length > 0
        ? initialScores
        : {};

    // Initialize window.markingScores
    if (typeof window !== "undefined") {
      window.markingScores = { ...startingScores };
    }

    return startingScores;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTotal, setCurrentTotal] = useState(0);
  const [currentPercentage, setCurrentPercentage] = useState(0);
  const { toast } = useToast();
  const router = useRouter();

  // Calculate total from global marking scores
  useEffect(() => {
    const calculateGlobalTotal = () => {
      if (typeof window !== "undefined" && window.markingScores) {
        const total = Object.values(window.markingScores).reduce(
          (sum, score) => sum + (score || 0),
          0
        );
        const percent = Math.round((total * 100) / totalPossible);

        setCurrentTotal(total);
        setCurrentPercentage(percent);
      }
    };

    // Calculate initial total
    calculateGlobalTotal();

    // Setup global update function
    if (typeof window !== "undefined" && mode === "submit") {
      window.updateTotalScore = calculateGlobalTotal;
    }

    return () => {
      // Cleanup
      if (typeof window !== "undefined" && mode === "submit") {
        window.updateTotalScore = undefined;
      }
    };
  }, [totalPossible, mode]);

  // Add event handler to prevent scroll wheel from changing the input values
  useEffect(() => {
    const preventScroll = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" &&
        target.getAttribute("type") === "number"
      ) {
        target.blur();
      }
    };

    // Add the event listener
    document.addEventListener("wheel", preventScroll, { passive: false });

    // Clean up
    return () => {
      document.removeEventListener("wheel", preventScroll);
    };
  }, []);

  const handleScoreChange = (questionId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    const maxMark = parseInt(
      questions.find((q) => q.id === questionId)?.mark || "0"
    );

    // Ensure score doesn't exceed maximum marks
    const validScore = Math.min(Math.max(0, numValue), maxMark);

    setScores((prev) => {
      const newScores = {
        ...prev,
        [questionId]: validScore,
      };

      // Update the parent component's scores
      if (window && window.markingScores) {
        window.markingScores[questionId] = validScore;

        // Trigger score update in parent component
        if (window.updateTotalScore) {
          window.updateTotalScore();
        }

        // Notify parent if callback provided
        if (onScoreChange) {
          onScoreChange();
        }
      }

      return newScores;
    });
  };

  const calculateTotal = () => {
    // When in input mode, just calculate for the current question
    if (mode === "input" && questions.length === 1) {
      return scores[questions[0].id] || 0;
    }

    // Otherwise calculate total of all scores from global object
    if (typeof window !== "undefined" && window.markingScores) {
      return Object.values(window.markingScores).reduce(
        (sum, score) => sum + (score || 0),
        0
      );
    }

    // Fallback to local scores
    return Object.values(scores).reduce((sum, score) => sum + (score || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get scores from global state or local state
      const allScores = window.markingScores || scores;

      // Validate scores
      if (!Object.keys(allScores).length) {
        throw new Error("No scores have been entered");
      }

      // Calculate total score and percentage
      const allQuestionScores = Object.values(allScores);
      const totalScore = allQuestionScores.reduce(
        (sum, score) => sum + (score || 0),
        0
      );
      const percentage = Math.round((totalScore * 100) / totalPossible);

      // Prepare detailed score data with answers
      const scoreData = {};
      questions.forEach((question) => {
        scoreData[question.id] = {
          score: allScores[question.id] || 0,
          answer:
            parsedAnswers.find((a) => a.question === question.id)?.answer || "",
        };
      });

      // Submit scores to server
      const result = await submitScore(
        resultId,
        allScores,
        staffId,
        "test",
        totalScore,
        percentage,
        JSON.stringify(scoreData)
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to submit scores");
      }

      // Show success notification
      toast({
        title: "Scores submitted successfully",
        description: `Assignment has been marked. Final score: ${totalScore}/${totalPossible} (${percentage}%)`,
        variant: "success",
      });

      // Prepare return URL with filter parameters
      const returnUrl = new URL(
        "/admin/assignment/mark",
        window.location.origin
      );

      // First try to use filterParams passed as props
      if (filterParams) {
        if (filterParams.groupId)
          returnUrl.searchParams.set("groupId", filterParams.groupId);
        if (filterParams.campusId)
          returnUrl.searchParams.set("campusId", filterParams.campusId);
        if (filterParams.outcomeId)
          returnUrl.searchParams.set("outcomeId", filterParams.outcomeId);
        if (filterParams.search)
          returnUrl.searchParams.set("search", filterParams.search);
        if (filterParams.sort)
          returnUrl.searchParams.set("sort", filterParams.sort);
      }

      // If any parameter is missing from props, try to get it from URL
      const currentUrlParams = new URLSearchParams(window.location.search);

      // List of parameters to preserve
      const paramsToCopy = [
        "groupId",
        "campusId",
        "outcomeId",
        "search",
        "sort",
      ];

      // Copy any parameters from URL that weren't already set from props
      paramsToCopy.forEach((param) => {
        if (!returnUrl.searchParams.has(param) && currentUrlParams.has(param)) {
          returnUrl.searchParams.set(param, currentUrlParams.get(param)!);
        }
      });

      // Add additional useful info to URL (like success status)
      returnUrl.searchParams.set("marked", "true");
      returnUrl.searchParams.set("resultId", resultId);

      // Short delay before redirect for better UX
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate back to assignments page with preserved filters
      router.push(returnUrl.toString());
    } catch (error) {
      // Enhanced error handling
      console.error("Error submitting scores:", error);

      // More descriptive error message based on error type
      let errorMessage = "An unexpected error occurred";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      toast({
        title: "Score Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  // If in input mode, just render the score input for the single question
  if (mode === "input" && questions.length === 1) {
    const question = questions[0];
    const answer = parsedAnswers.find((a) => a.question === question.id);
    const score =
      window.markingScores?.[question.id] || scores[question.id] || 0;
    const maxMark = parseInt(question.mark);

    return (
      <>
        <style jsx>{noScrollInputStyles}</style>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            max={maxMark}
            value={score}
            onChange={(e) => handleScoreChange(question.id, e.target.value)}
            className="w-16"
            onWheel={(e) => e.currentTarget.blur()}
          />
          <span className="text-sm text-muted-foreground">/ {maxMark}</span>
        </div>
      </>
    );
  }

  // In submit mode, use the current total from state
  return (
    <>
      <style jsx>{noScrollInputStyles}</style>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="mb-4 text-right">
          <p className="font-medium">
            Total Score: {currentTotal}/{totalPossible} ({currentPercentage}%)
          </p>
        </div>
        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit All Marks"}
          </Button>
        </div>
      </form>
    </>
  );
}
