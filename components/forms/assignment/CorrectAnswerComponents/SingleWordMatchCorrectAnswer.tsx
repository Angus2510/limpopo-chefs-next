import React from 'react';
import { Input } from '@/components/ui/input';

interface SingleWordMatchCorrectAnswerProps {
  correctAnswer: string;
  setCorrectAnswer: (value: string) => void;
}

const SingleWordMatchCorrectAnswer: React.FC<SingleWordMatchCorrectAnswerProps> = ({ correctAnswer, setCorrectAnswer }) => {
  return (
    <Input
      value={correctAnswer}
      onChange={(e) => setCorrectAnswer(e.target.value)}
      placeholder="Enter correct single word match answer"
    />
  );
};

export default SingleWordMatchCorrectAnswer;
