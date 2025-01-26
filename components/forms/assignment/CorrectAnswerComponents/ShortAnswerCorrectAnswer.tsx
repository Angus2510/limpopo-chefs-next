import React from 'react';
import { Input } from '@/components/ui/input';

interface ShortAnswerCorrectAnswerProps {
  correctAnswer: string;
  setCorrectAnswer: (value: string) => void;
}

const ShortAnswerCorrectAnswer: React.FC<ShortAnswerCorrectAnswerProps> = ({ correctAnswer, setCorrectAnswer }) => {
  return (
    <Input
      value={correctAnswer}
      onChange={(e) => setCorrectAnswer(e.target.value)}
      placeholder="Enter correct short answer"
    />
  );
};

export default ShortAnswerCorrectAnswer;
