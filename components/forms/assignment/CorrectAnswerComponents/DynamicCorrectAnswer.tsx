import React from 'react';

// Define the type for the question types
type QuestionType = 'short-answer' | 'long-answer' | 'multiple-choice' | 'true-false' | 'match' | 'single-word-match';

// Mapping of question types to their respective components
const componentsMap: Record<QuestionType, React.LazyExoticComponent<React.FC<{ correctAnswer: string; setCorrectAnswer: (value: string) => void }>>> = {
  'short-answer': React.lazy(() => import('./ShortAnswerCorrectAnswer')),
  'long-answer': React.lazy(() => import('./LongAnswerCorrectAnswer')),
  'multiple-choice': React.lazy(() => import('./MultipleChoiceCorrectAnswer')),
  'true-false': React.lazy(() => import('./TrueFalseCorrectAnswer')),
  'match': React.lazy(() => import('./MatchCorrectAnswer')),
  'single-word-match': React.lazy(() => import('./SingleWordMatchCorrectAnswer')), // Correct component
};

interface DynamicCorrectAnswerProps {
  questionType: QuestionType; // Use the defined QuestionType union
  correctAnswer: string;
  setCorrectAnswer: (value: string) => void;
}

const DynamicCorrectAnswer: React.FC<DynamicCorrectAnswerProps> = ({ questionType, correctAnswer, setCorrectAnswer }) => {
  const CorrectAnswerComponent = componentsMap[questionType]; // Safe access using the defined type

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <CorrectAnswerComponent correctAnswer={correctAnswer} setCorrectAnswer={setCorrectAnswer} />
    </React.Suspense>
  );
};

export default DynamicCorrectAnswer;
