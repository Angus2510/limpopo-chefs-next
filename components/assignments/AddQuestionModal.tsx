"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const QUESTION_TYPES = {
  MULTIPLE_CHOICE: "multiple-choice",
  SHORT_ANSWER: "short-answer",
  LONG_ANSWER: "long-answer",
  TRUE_FALSE: "true-false",
} as const;

type QuestionType = (typeof QUESTION_TYPES)[keyof typeof QUESTION_TYPES];

interface Option {
  id: string;
  value: string;
  isCorrect: boolean;
}

interface QuestionData {
  text: string;
  type: QuestionType;
  mark: string;
  options: Option[];
  correctAnswer: string | { options: string[]; correctOption: number };
}

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (questionData: QuestionData) => void;
}

export function AddQuestionModal({
  isOpen,
  onClose,
  onSave,
}: AddQuestionModalProps) {
  const { toast } = useToast();

  const [questionData, setQuestionData] = useState<QuestionData>({
    text: "",
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    mark: "1",
    options: [
      { id: crypto.randomUUID(), value: "", isCorrect: false },
      { id: crypto.randomUUID(), value: "", isCorrect: false },
    ],
    correctAnswer: { options: [], correctOption: 0 },
  });

  const addOption = () => {
    setQuestionData((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        { id: crypto.randomUUID(), value: "", isCorrect: false },
      ],
    }));
  };

  const removeOption = (id: string) => {
    if (questionData.options.length <= 2) {
      toast({
        variant: "destructive",
        description: "Multiple choice questions must have at least 2 options",
      });
      return;
    }

    setQuestionData((prev) => ({
      ...prev,
      options: prev.options.filter((opt) => opt.id !== id),
    }));
  };

  const updateOption = (id: string, updates: Partial<Option>) => {
    setQuestionData((prev) => ({
      ...prev,
      options: prev.options.map((opt) => {
        if (opt.id === id) {
          // If setting this option as correct, unset others
          if (updates.isCorrect) {
            return { ...opt, ...updates, isCorrect: true };
          }
          return { ...opt, ...updates };
        }
        // If setting another option as correct, unset this one
        if (updates.isCorrect) {
          return { ...opt, isCorrect: false };
        }
        return opt;
      }),
    }));
  };

  const handleTypeChange = (newType: QuestionType) => {
    setQuestionData((prev) => ({
      ...prev,
      type: newType,
      options:
        newType === QUESTION_TYPES.MULTIPLE_CHOICE
          ? [
              { id: crypto.randomUUID(), value: "", isCorrect: false },
              { id: crypto.randomUUID(), value: "", isCorrect: false },
            ]
          : [],
      correctAnswer:
        newType === QUESTION_TYPES.MULTIPLE_CHOICE
          ? { options: [], correctOption: 0 }
          : "",
    }));
  };

  const validateForm = (): boolean => {
    if (!questionData.text.trim()) {
      toast({
        variant: "destructive",
        description: "Please enter a question text",
      });
      return false;
    }

    if (questionData.type === QUESTION_TYPES.MULTIPLE_CHOICE) {
      // Check if all options have values
      const emptyOptions = questionData.options.some(
        (opt) => !opt.value.trim()
      );
      if (emptyOptions) {
        toast({
          variant: "destructive",
          description: "All options must have values",
        });
        return false;
      }

      // Check if a correct answer is selected
      const hasCorrectAnswer = questionData.options.some(
        (opt) => opt.isCorrect
      );
      if (!hasCorrectAnswer) {
        toast({
          variant: "destructive",
          description: "Please select a correct answer",
        });
        return false;
      }
    } else if (!questionData.correctAnswer) {
      toast({
        variant: "destructive",
        description: "Please provide a correct answer",
      });
      return false;
    }

    return true;
  };

  const formatCorrectAnswer = () => {
    if (questionData.type === QUESTION_TYPES.MULTIPLE_CHOICE) {
      const correctIndex = questionData.options.findIndex(
        (opt) => opt.isCorrect
      );
      return {
        options: questionData.options.map((opt) => opt.value),
        correctOption: correctIndex >= 0 ? correctIndex : 0,
      };
    }
    return questionData.correctAnswer || "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formattedQuestion = {
      ...questionData,
      correctAnswer: formatCorrectAnswer(),
      // Clean up options for database
      options:
        questionData.type === QUESTION_TYPES.MULTIPLE_CHOICE
          ? questionData.options.map(({ id, value }) => ({
              id,
              value,
            }))
          : [],
    };

    onSave(formattedQuestion);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setQuestionData({
      text: "",
      type: QUESTION_TYPES.MULTIPLE_CHOICE,
      mark: "1",
      options: [
        { id: crypto.randomUUID(), value: "", isCorrect: false },
        { id: crypto.randomUUID(), value: "", isCorrect: false },
      ],
      correctAnswer: { options: [], correctOption: 0 },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text">Question Text</Label>
            <Textarea
              id="text"
              value={questionData.text}
              onChange={(e) =>
                setQuestionData({ ...questionData, text: e.target.value })
              }
              placeholder="Enter question text"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Question Type</Label>
              <Select
                value={questionData.type}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={QUESTION_TYPES.MULTIPLE_CHOICE}>
                    Multiple Choice
                  </SelectItem>
                  <SelectItem value={QUESTION_TYPES.SHORT_ANSWER}>
                    Short Answer
                  </SelectItem>
                  <SelectItem value={QUESTION_TYPES.LONG_ANSWER}>
                    Long Answer
                  </SelectItem>
                  <SelectItem value={QUESTION_TYPES.TRUE_FALSE}>
                    True/False
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marks">Marks</Label>
              <Input
                id="marks"
                type="number"
                min="1"
                value={questionData.mark}
                onChange={(e) =>
                  setQuestionData({ ...questionData, mark: e.target.value })
                }
                required
              />
            </div>
          </div>

          {questionData.type === QUESTION_TYPES.MULTIPLE_CHOICE && (
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-4">
                <Label>
                  Options{" "}
                  <span className="text-sm text-muted-foreground">
                    (Select the correct answer)
                  </span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>
              {questionData.options.map((option, index) => (
                <div key={option.id} className="flex gap-2 items-center">
                  <div className="w-8 text-sm text-muted-foreground">
                    {String.fromCharCode(65 + index)}.
                  </div>
                  <Input
                    value={option.value}
                    onChange={(e) =>
                      updateOption(option.id, { value: e.target.value })
                    }
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="flex-1"
                    required
                  />
                  <Checkbox
                    checked={option.isCorrect}
                    onCheckedChange={(checked) =>
                      updateOption(option.id, {
                        isCorrect: checked as boolean,
                      })
                    }
                    aria-label="Correct answer"
                  />
                  {questionData.options.length > 2 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeOption(option.id)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {questionData.type !== QUESTION_TYPES.MULTIPLE_CHOICE && (
            <div className="space-y-2">
              <Label htmlFor="correctAnswer">Correct Answer</Label>
              {questionData.type === QUESTION_TYPES.LONG_ANSWER ? (
                <Textarea
                  id="correctAnswer"
                  value={questionData.correctAnswer as string}
                  onChange={(e) =>
                    setQuestionData({
                      ...questionData,
                      correctAnswer: e.target.value,
                    })
                  }
                  placeholder="Enter model answer or marking guidelines"
                  required
                />
              ) : questionData.type === QUESTION_TYPES.TRUE_FALSE ? (
                <Select
                  value={questionData.correctAnswer as string}
                  onValueChange={(value) =>
                    setQuestionData({
                      ...questionData,
                      correctAnswer: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select correct answer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="correctAnswer"
                  value={questionData.correctAnswer as string}
                  onChange={(e) =>
                    setQuestionData({
                      ...questionData,
                      correctAnswer: e.target.value,
                    })
                  }
                  placeholder="Enter the correct answer"
                  required
                />
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Question</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
