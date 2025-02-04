import React from 'react';
import { Input } from '@/components/ui/input';

interface LongAnswerCorrectAnswerProps {
  correctAnswer: string;
  setCorrectAnswer: (value: string) => void;
}

const LongAnswerCorrectAnswer: React.FC<LongAnswerCorrectAnswerProps> = ({ correctAnswer, setCorrectAnswer }) => {
  return (
    <Input
      value={correctAnswer}
      onChange={(e) => setCorrectAnswer(e.target.value)}
      placeholder="Enter correct long answer"
    />
  );
};

export default LongAnswerCorrectAnswer;
