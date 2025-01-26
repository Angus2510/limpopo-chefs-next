import React from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuestionsListProps {
  questionFields: { id: string; questionText: string; questionType: string; correctAnswer: string }[];
  removeQuestion: (index: number) => void;
}

const QuestionsList: React.FC<QuestionsListProps> = ({ questionFields, removeQuestion }) => (
  <div className="space-y-4">
    <CardHeader>
      <CardTitle>Added Questions</CardTitle>
    </CardHeader>
    <CardContent>
      {questionFields.length === 0 ? (
        <p>No questions added yet.</p>
      ) : (
        questionFields.map((question, index) => (
          <div key={question.id} className="flex justify-between items-center mb-2">
            <p>{`Q${index + 1}: ${question.questionText} (${question.questionType}) - Correct Answer: ${question.correctAnswer}`}</p>
            <Button type="button" variant="ghost" onClick={() => removeQuestion(index)}>
              Remove
            </Button>
          </div>
        ))
      )}
    </CardContent>
  </div>
);

export default QuestionsList;
