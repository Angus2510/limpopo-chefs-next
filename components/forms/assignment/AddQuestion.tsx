import React from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DynamicCorrectAnswer from './CorrectAnswerComponents/DynamicCorrectAnswer'; // Import the dynamic correct answer component

interface AddQuestionProps {
  newQuestion: {
    questionText: string;
    questionType: string;
    correctAnswer: string;
  };
  setNewQuestion: React.Dispatch<React.SetStateAction<{
    questionText: string;
    questionType: string;
    correctAnswer: string;
  }>>;
  addQuestion: (question: any) => void;
  toast: any;
}

const AddQuestion: React.FC<AddQuestionProps> = ({ newQuestion, setNewQuestion, addQuestion, toast }) => {
  const handleAddQuestion = () => {
    if (newQuestion.questionText && newQuestion.correctAnswer) {
      addQuestion(newQuestion);
      setNewQuestion({ questionText: '', questionType: 'short-answer', correctAnswer: '' });
    } else {
      toast({
        title: 'Please fill in the required fields.',
        description: 'Both question text and correct answer cannot be empty.',
      });
    }
  };

  return (
    <div className="space-y-4">
      <CardHeader>
        <CardTitle>Add a Question</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Question Text Input */}
        <FormItem>
          <FormLabel>Question Text</FormLabel>
          <FormControl>
            <Input
              value={newQuestion.questionText}
              onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
              placeholder="Enter question text"
            />
          </FormControl>
        </FormItem>

        {/* Question Type Selector */}
        <FormItem>
          <FormLabel>Question Type</FormLabel>
          <FormControl>
            <Select
              value={newQuestion.questionType}
              onValueChange={(value) => setNewQuestion({ ...newQuestion, questionType: value })}
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
                <SelectItem value="single-word-match">Single Word Match</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>

        {/* Dynamic Correct Answer Input */}
        <FormItem>
          <FormLabel>Correct Answer</FormLabel>
          <FormControl>
            <DynamicCorrectAnswer
              questionType={newQuestion.questionType}
              correctAnswer={newQuestion.correctAnswer}
              setCorrectAnswer={(value) => setNewQuestion({ ...newQuestion, correctAnswer: value })}
            />
          </FormControl>
        </FormItem>

        {/* Add Question Button */}
        <Button type="button" onClick={handleAddQuestion} className="sm:col-span-2">
          Add Question
        </Button>
      </CardContent>
    </div>
  );
};

export default AddQuestion;
