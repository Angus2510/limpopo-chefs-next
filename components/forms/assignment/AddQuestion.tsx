import React, { useState } from "react";
import { X, Upload } from "lucide-react";
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

// Types for our components
interface QuestionBase {
  questionText: string;
  questionType: string;
  correctAnswer: any;
}

interface AddQuestionProps {
  newQuestion: QuestionBase;
  setNewQuestion: React.Dispatch<React.SetStateAction<QuestionBase>>;
  addQuestion: (question: any) => void;
  toast: any;
}

// Multiple Choice Answer Component
const MultipleChoiceInput: React.FC<{
  value: any;
  onChange: (value: any) => void;
}> = ({ value, onChange }) => {
  const [options, setOptions] = useState(value?.options || ["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState(value?.correctOption || 0);

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

// Match Columns Component
const MatchColumnsInput: React.FC<{
  value: any;
  onChange: (value: any) => void;
}> = ({ value, onChange }) => {
  const [pairs, setPairs] = useState(
    value?.pairs || Array(4).fill({ text: "", picture: "" })
  );

  const handlePairChange = (
    index: number,
    field: "text" | "picture",
    newValue: string
  ) => {
    const newPairs = [...pairs];
    newPairs[index] = { ...newPairs[index], [field]: newValue };
    setPairs(newPairs);
    onChange({ pairs: newPairs });
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        {pairs.map((pair, index) => (
          <div key={`text-${index}`} className="space-y-2">
            <Input
              value={pair.text}
              onChange={(e) => handlePairChange(index, "text", e.target.value)}
              placeholder="Enter text"
            />
            <div className="flex items-center gap-2 text-gray-500">
              <Upload size={16} />
              <span>Or,</span>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {pairs.map((pair, index) => (
          <div key={`picture-${index}`} className="space-y-2">
            <Input
              value={pair.picture}
              onChange={(e) =>
                handlePairChange(index, "picture", e.target.value)
              }
              placeholder="Upload picture"
            />
            <div className="flex items-center gap-2 text-gray-500">
              <Upload size={16} />
              <span>Or,</span>
            </div>
          </div>
        ))}
      </div>
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
    case "multiple-choice":
      return (
        <MultipleChoiceInput
          value={correctAnswer}
          onChange={setCorrectAnswer}
        />
      );
    case "match":
      return (
        <MatchColumnsInput value={correctAnswer} onChange={setCorrectAnswer} />
      );
    case "true-false":
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
    case "long-answer":
      return (
        <Textarea
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          placeholder="Enter model answer"
          className="min-h-[150px]"
        />
      );
    case "single-word-match":
      return (
        <Input
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          placeholder="Enter single word answer"
        />
      );
    default:
      return (
        <Input
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          placeholder="Enter correct answer"
        />
      );
  }
};

const AddQuestion: React.FC<AddQuestionProps> = ({
  newQuestion,
  setNewQuestion,
  addQuestion,
  toast,
}) => {
  const handleAddQuestion = () => {
    if (newQuestion.questionText && newQuestion.correctAnswer) {
      addQuestion(newQuestion);
      setNewQuestion({
        questionText: "",
        questionType: "short-answer",
        correctAnswer: "",
      });
    } else {
      toast({
        title: "Please fill in the required fields.",
        description: "Both question text and correct answer cannot be empty.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <CardHeader>
        <CardTitle>Add a Question</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormItem>
          <FormLabel>Question Text</FormLabel>
          <FormControl>
            <Input
              value={newQuestion.questionText}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, questionText: e.target.value })
              }
              placeholder="Enter question text"
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
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Question Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short-answer">Short Answer</SelectItem>
                <SelectItem value="long-answer">Long Answer</SelectItem>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="true-false">True/False</SelectItem>
                <SelectItem value="match">Match</SelectItem>
                <SelectItem value="single-word-match">
                  Single Word Match
                </SelectItem>
              </SelectContent>
            </Select>
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
