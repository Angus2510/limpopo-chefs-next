import React from 'react';
import { Input } from '@/components/ui/input';

interface MatchCorrectAnswerProps {
  correctAnswer: string;
  setCorrectAnswer: (value: string) => void;
}

const MatchCorrectAnswer: React.FC<MatchCorrectAnswerProps> = ({ correctAnswer, setCorrectAnswer }) => {
  return (
    <Input
      value={correctAnswer}
      onChange={(e) => setCorrectAnswer(e.target.value)}
      placeholder="Enter correct match answer"
    />
  );
};

export default MatchCorrectAnswer;
