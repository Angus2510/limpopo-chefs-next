import React from 'react';
import { Input } from '@/components/ui/input';

interface MultipleChoiceCorrectAnswerProps {
  correctAnswer: string;
  setCorrectAnswer: (value: string) => void;
}

const MultipleChoiceCorrectAnswer: React.FC<MultipleChoiceCorrectAnswerProps> = ({ correctAnswer, setCorrectAnswer }) => {
  return (
    <Input
      value={correctAnswer}
      onChange={(e) => setCorrectAnswer(e.target.value)}
      placeholder="Enter correct multiple choice answer"
    />
  );
};

export default MultipleChoiceCorrectAnswer;
