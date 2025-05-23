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
  mode?: "input" | "submit"; // Added mode prop
  onScoreChange?: () => void; // New callback to notify parent of score changes
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
  mode = "submit", // Default to full submit mode
  onScoreChange,
}: MarkAnswersProps) {
  // Initialize scores and reset window.markingScores to prevent accumulation
  const [scores, setScores] = useState<Record<string, number>>(() => {
    // Start with initial scores if provided, otherwise empty object
    const startingScores = initialScores || {};

    // Initialize window.markingScores with these values (don't accumulate)
    if (typeof window !== "undefined") {
      if (
        !window.markingScores ||
        Object.keys(window.markingScores).length === 0
      ) {
        window.markingScores = { ...startingScores };
      }
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

    // Get the global scores object that contains all scores
    const allScores = window.markingScores || scores;

    try {
      // Calculate the total from the global scores object
      const allQuestionScores = Object.values(allScores);
      const totalScore = allQuestionScores.reduce(
        (sum, score) => sum + (score || 0),
        0
      );
      const percentage = Math.round((totalScore * 100) / totalPossible);

      // Create an object with all scores and their corresponding answers
      const scoreData = {};
      questions.forEach((question) => {
        scoreData[question.id] = {
          score: allScores[question.id] || 0,
          answer:
            parsedAnswers.find((a) => a.question === question.id)?.answer || "",
        };
      });

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
        throw new Error(result.error);
      }

      toast({
        title: "Scores submitted successfully",
        description: `Assignment has been marked. Final score: ${totalScore}/${totalPossible} (${percentage}%)`,
        variant: "success",
      });

      // Short delay before redirect
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push(`/admin/assignment/mark/group/${groupId}`);
    } catch (error) {
      console.error("Error in handleSubmit:", error);

      toast({
        title: "Error",
        description: `Failed to submit scores: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
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
