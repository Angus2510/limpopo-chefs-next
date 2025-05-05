import { Question } from "@/types/assignments/assignments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrueFalse } from "./QuestionTypes/TrueFalse";
import { MultipleChoice } from "./QuestionTypes/MultipleChoice";
import { TextAnswer } from "./QuestionTypes/TextAnswer";

interface QuestionViewProps {
  question: Question;
  currentAnswer?: string;
  onAnswerChange: (questionId: string, value: string) => void;
  preventCopyPaste: (e: React.ClipboardEvent) => void;
}

export function QuestionView({
  question,
  currentAnswer,
  onAnswerChange,
  preventCopyPaste,
}: QuestionViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>{question.text}</span>
          <span className="text-sm text-muted-foreground">
            {question.mark} marks
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {question.type === "true-false" && (
          <TrueFalse
            questionId={question.id}
            currentAnswer={currentAnswer}
            onChange={onAnswerChange}
          />
        )}
        {question.type === "multiple-choice" && (
          <MultipleChoice
            questionId={question.id}
            options={question.options || []}
            currentAnswer={currentAnswer}
            onChange={onAnswerChange}
          />
        )}
        {(question.type === "short-answer" ||
          question.type === "long-answer") && (
          <TextAnswer
            questionId={question.id}
            type={question.type}
            currentAnswer={currentAnswer}
            onChange={onAnswerChange}
            preventCopyPaste={preventCopyPaste}
          />
        )}
      </CardContent>
    </Card>
  );
}
