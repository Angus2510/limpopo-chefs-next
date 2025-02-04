import React from 'react';
import { Input } from '@/components/ui/input';

interface TrueFalseCorrectAnswerProps {
  correctAnswer: string;
  setCorrectAnswer: (value: string) => void;
}

const TrueFalseCorrectAnswer: React.FC<TrueFalseCorrectAnswerProps> = ({ correctAnswer, setCorrectAnswer }) => {
  return (
    <Input
      value={correctAnswer}
      onChange={(e) => setCorrectAnswer(e.target.value)}
      placeholder="Enter correct true/false answer"
    />
  );
};

export default TrueFalseCorrectAnswer;
