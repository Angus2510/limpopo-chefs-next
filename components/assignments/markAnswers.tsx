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

// Rest of your component remains the same
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
  studentId: string; // Add this prop
}

export function MarkAnswers({
  resultId,
  questions,
  parsedAnswers,
  initialScores,
  totalPossible,
  staffId,
  studentId, // Add this prop
}: MarkAnswersProps) {
  const [scores, setScores] = useState<Record<string, number>>(
    initialScores || {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

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

    setScores((prev) => ({
      ...prev,
      [questionId]: validScore,
    }));
  };

  const calculateTotal = () => {
    return Object.values(scores).reduce((sum, score) => sum + score, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const totalScore = calculateTotal();
      const percentage = Math.round((totalScore * 100) / totalPossible);

      // Debug log
      console.log("Starting submission:", {
        resultId,
        staffId,
        totalScore,
        percentage,
        studentId,
      });

      // Create an object with all scores and their corresponding answers
      const scoreData = {};
      questions.forEach((question) => {
        scoreData[question.id] = {
          score: scores[question.id] || 0,
          answer:
            parsedAnswers.find((a) => a.question === question.id)?.answer || "",
        };
      });

      // Debug log
      console.log("Score data prepared:", scoreData);

      const result = await submitScore(
        resultId,
        scores,
        staffId,
        "test",
        totalScore,
        percentage,
        JSON.stringify(scoreData)
      );

      if (!result.success) {
        console.error("Submission failed:", result.error);
        throw new Error(result.error);
      }

      // Debug log
      console.log("Submission successful:", result.data);

      toast({
        title: "Scores submitted successfully",
        description: `Assignment has been marked. Final score: ${totalScore}/${totalPossible} (${percentage}%)`,
        variant: "success",
      });

      // Short delay before redirect
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/admin/assignment");
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
  const totalScore = calculateTotal();
  const percentage = Math.round((totalScore * 100) / totalPossible);

  return (
    <>
      {/* Add the style tag to the component */}
      <style jsx>{noScrollInputStyles}</style>

      <form onSubmit={handleSubmit} className="h-full flex flex-col">
        <div className="flex-grow space-y-6">
          {questions?.map((question, index) => {
            // Find this student's answer for this question
            const answer = parsedAnswers.find(
              (a) => a.question === question.id
            );
            const score = scores[question.id] || 0;
            const maxMark = parseInt(question.mark);

            return (
              <div key={question.id} className="border p-4 rounded-lg">
                <h3 className="font-bold mb-2">
                  Question {index + 1} ({question.mark} marks)
                </h3>

                {answer ? (
                  <div className="space-y-4">
                    <div className="bg-muted p-3 rounded-md">
                      <h4 className="text-sm font-medium mb-2">
                        Student Answer:
                      </h4>
                      <p className="text-sm">
                        {typeof answer.answer === "string"
                          ? answer.answer
                          : JSON.stringify(answer.answer, null, 2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium">Score:</div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max={maxMark}
                          value={score}
                          onChange={(e) =>
                            handleScoreChange(question.id, e.target.value)
                          }
                          className="w-16"
                          // Add onWheel event handler to prevent scroll
                          onWheel={(e) => e.currentTarget.blur()}
                        />
                        <span className="text-sm text-muted-foreground">
                          / {maxMark}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic p-3 bg-muted/50 rounded-md">
                    No answer provided for this question
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Total score summary at bottom */}
        <div className="mt-6 p-4 border rounded-lg bg-muted/10">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Total Score</h3>
            <div className="text-xl font-bold">
              {totalScore}/{totalPossible} ({percentage}%)
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Marks"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
