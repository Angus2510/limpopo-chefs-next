import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Question Types Enum
const QUESTION_TYPES = {
  SHORT_ANSWER: "short-answer",
  LONG_ANSWER: "long-answer",
  MULTIPLE_CHOICE: "multiple-choice",
  TRUE_FALSE: "true-false",
} as const;

// Interfaces with stricter typing
interface QuestionOption {
  value?: string;
}

interface Question {
  questionText: string;
  questionType: string;
  mark: string;
  correctAnswer: string;
  options: QuestionOption[];
}

interface AddQuestionProps {
  newQuestion: Question;
  setNewQuestion: (question: Question) => void;
  addQuestion: (question: Question) => void;
  toast: any;
  isEditing?: boolean;
  onUpdate?: () => void;
}

// Multiple Choice Input Component
const MultipleChoiceInput: React.FC<{
  value: any;
  onChange: (value: any) => void;
}> = ({ value, onChange }) => {
  const [options, setOptions] = useState<string[]>(
    value?.options || ["", "", "", ""]
  );
  const [correctOption, setCorrectOption] = useState<number>(
    value?.correctOption || 0
  );

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index] = text;
    setOptions(newOptions);
    onChange({ options: newOptions, correctOption });
  };

  const handleCorrectOptionChange = (index: number) => {
    setCorrectOption(index);
    onChange({ options, correctOption: index });
  };

  return (
    <div className="space-y-4">
      {options.map((option, index) => (
        <div key={index} className="flex items-center gap-4">
          <span className="w-6">{String.fromCharCode(65 + index)}.</span>
          <Input
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            placeholder={`Option ${String.fromCharCode(65 + index)}`}
          />
          <div className="flex items-center gap-2">
            <Checkbox
              checked={correctOption === index}
              onCheckedChange={() => handleCorrectOptionChange(index)}
            />
            <span>Correct</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Dynamic Correct Answer Component
const DynamicCorrectAnswer: React.FC<{
  questionType: string;
  correctAnswer: any;
  setCorrectAnswer: (value: any) => void;
}> = ({ questionType, correctAnswer, setCorrectAnswer }) => {
  switch (questionType) {
    case QUESTION_TYPES.MULTIPLE_CHOICE:
      return (
        <MultipleChoiceInput
          value={correctAnswer}
          onChange={setCorrectAnswer}
        />
      );
    case QUESTION_TYPES.LONG_ANSWER:
      return (
        <Textarea
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          placeholder="Enter model answer"
          className="min-h-[200px]"
        />
      );
    case QUESTION_TYPES.TRUE_FALSE:
      return (
        <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
          <SelectTrigger>
            <SelectValue placeholder="Select correct answer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      );
    default:
      return (
        <Textarea
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          placeholder="Enter model answer"
          className="min-h-[200px]"
        />
      );
  }
};

// Main AddQuestion Component
const AddQuestion: React.FC<AddQuestionProps> = ({
  newQuestion,
  setNewQuestion,
  addQuestion,
  toast,
}) => {
  const validateQuestion = (): boolean => {
    if (!newQuestion.questionText.trim()) {
      toast({
        title: "Error",
        description: "Question text is required",
        variant: "destructive",
      });
      return false;
    }

    if (!newQuestion.mark || parseInt(newQuestion.mark) < 1) {
      toast({
        title: "Error",
        description: "Mark allocation must be at least 1",
        variant: "destructive",
      });
      return false;
    }

    if (newQuestion.questionType === QUESTION_TYPES.MULTIPLE_CHOICE) {
      const mcAnswer = newQuestion.correctAnswer;
      if (!mcAnswer?.options?.some(Boolean)) {
        toast({
          title: "Error",
          description: "At least one option is required for multiple choice",
          variant: "destructive",
        });
        return false;
      }
      if (mcAnswer.correctOption === undefined) {
        toast({
          title: "Error",
          description: "Please select a correct answer",
          variant: "destructive",
        });
        return false;
      }
    } else if (!newQuestion.correctAnswer) {
      toast({
        title: "Error",
        description: "Correct answer is required",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const formatQuestionForSubmission = (): Question => {
    let formattedQuestion: Question = {
      questionText: newQuestion.questionText.trim(),
      questionType: newQuestion.questionType,
      mark: newQuestion.mark || "1",
      correctAnswer: "",
      options: [],
    };

    if (newQuestion.questionType === QUESTION_TYPES.MULTIPLE_CHOICE) {
      const mcAnswer = newQuestion.correctAnswer;
      formattedQuestion.correctAnswer =
        mcAnswer.options[mcAnswer.correctOption];
      formattedQuestion.options = mcAnswer.options.map((option: string) => ({
        value: option,
      }));
    } else {
      formattedQuestion.correctAnswer = String(newQuestion.correctAnswer);
    }

    return formattedQuestion;
  };

  const handleAddQuestion = () => {
    if (!validateQuestion()) return;

    const formattedQuestion = formatQuestionForSubmission();
    addQuestion(formattedQuestion);

    // Reset form
    setNewQuestion({
      questionText: "",
      questionType: QUESTION_TYPES.SHORT_ANSWER,
      mark: "1",
      correctAnswer: "",
      options: [],
    });

    toast({
      title: "Success",
      description: "Question added successfully",
    });
  };

  return (
    <div className="space-y-4">
      <CardHeader>
        <CardTitle>Add a Question</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormItem>
          <FormLabel>Question</FormLabel>
          <FormControl>
            <Textarea
              value={newQuestion.questionText}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, questionText: e.target.value })
              }
              placeholder="Enter question text"
              className="min-h-[100px] resize-vertical"
            />
          </FormControl>
        </FormItem>

        <FormItem>
          <FormLabel>Question Type</FormLabel>
          <FormControl>
            <Select
              value={newQuestion.questionType}
              onValueChange={(value) =>
                setNewQuestion({
                  ...newQuestion,
                  questionType: value,
                  correctAnswer: "",
                  options: [],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Question Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={QUESTION_TYPES.SHORT_ANSWER}>
                  Short Answer
                </SelectItem>
                <SelectItem value={QUESTION_TYPES.LONG_ANSWER}>
                  Long Answer
                </SelectItem>
                <SelectItem value={QUESTION_TYPES.MULTIPLE_CHOICE}>
                  Multiple Choice
                </SelectItem>
                <SelectItem value={QUESTION_TYPES.TRUE_FALSE}>
                  True/False
                </SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>

        {/* Mark Allocation Field */}
        <FormItem>
          <FormLabel>Mark Allocation</FormLabel>
          <FormControl>
            <Input
              type="number"
              min="1"
              value={newQuestion.mark}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, mark: e.target.value })
              }
              placeholder="Enter marks"
            />
          </FormControl>
        </FormItem>

        <FormItem className="sm:col-span-2">
          <FormLabel>Correct Answer</FormLabel>
          <FormControl>
            <DynamicCorrectAnswer
              questionType={newQuestion.questionType}
              correctAnswer={newQuestion.correctAnswer}
              setCorrectAnswer={(value) =>
                setNewQuestion({ ...newQuestion, correctAnswer: value })
              }
            />
          </FormControl>
        </FormItem>

        <Button
          type="button"
          onClick={handleAddQuestion}
          className="sm:col-span-2"
        >
          Add Question
        </Button>
      </CardContent>
    </div>
  );
};

export default AddQuestion;
