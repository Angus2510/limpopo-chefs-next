"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { submitScore } from "@/lib/actions/assignments/submitScore";

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
}

export function MarkAnswers({
  resultId,
  questions,
  parsedAnswers,
  initialScores,
  totalPossible,
  staffId,
}: MarkAnswersProps) {
  const [scores, setScores] = useState<Record<string, number>>(
    initialScores || {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

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
      // Pass the scores object directly, no JSON.stringify needed
      const result = await submitScore(resultId, scores, staffId);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Scores submitted successfully",
        description: "The assignment has been marked.",
      });

      // Refresh to show updated scores
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to submit scores: ${
          error.message || "Unknown error"
        }`,
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalScore = calculateTotal();
  const percentage = Math.round((totalScore * 100) / totalPossible);

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {questions?.map((question, index) => {
          // Find this student's answer for this question
          const answer = parsedAnswers.find((a) => a.question === question.id);
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
  );
}
