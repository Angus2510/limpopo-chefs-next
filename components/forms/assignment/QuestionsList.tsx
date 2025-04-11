import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Add this import

interface QuestionsListProps {
  questionFields: {
    id: string;
    questionText: string;
    questionType: string;
    correctAnswer: string;
    mark?: string;
  }[];
  removeQuestion: (index: number) => void;
  editQuestion: (index: number, updatedQuestion: any) => void; // Add this
}

const QuestionsList: React.FC<QuestionsListProps> = ({
  questionFields,
  removeQuestion,
  editQuestion,
}) => {
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [editedText, setEditedText] = React.useState("");
  const [editedAnswer, setEditedAnswer] = React.useState("");

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditedText(questionFields[index].questionText);
    setEditedAnswer(questionFields[index].correctAnswer);
  };

  const handleSave = (index: number) => {
    editQuestion(index, {
      ...questionFields[index],
      questionText: editedText,
      correctAnswer: editedAnswer,
    });
    setEditingIndex(null);
  };

  return (
    <div className="space-y-4">
      <CardHeader>
        <CardTitle>Added Questions</CardTitle>
      </CardHeader>
      <CardContent>
        {questionFields.length === 0 ? (
          <p>No questions added yet.</p>
        ) : (
          questionFields.map((question, index) => (
            <Card key={question.id || index} className="mb-4 p-4">
              <div className="flex flex-col gap-4">
                {editingIndex === index ? (
                  <>
                    <Input
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="mb-2"
                    />
                    <Input
                      value={editedAnswer}
                      onChange={(e) => setEditedAnswer(e.target.value)}
                      className="mb-2"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSave(index)}
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingIndex(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h4 className="font-medium mb-1">Question {index + 1}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {question.questionText}
                      </p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Type: {question.questionType}</span>
                        <span>Answer: {question.correctAnswer}</span>
                        {question.mark && <span>Marks: {question.mark}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(index)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          ))
        )}
      </CardContent>
    </div>
  );
};

export default QuestionsList;
