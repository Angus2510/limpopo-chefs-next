import { Question } from "@/types/assignments/assignments";
import { QuestionItem } from "./QuestionItem";

interface QuestionNavigationProps {
  questions: Question[];
  currentIndex: number;
  questionStates: {
    id: string;
    isFlagged: boolean;
    isAnswered: boolean;
  }[];
  onQuestionSelect: (index: number) => void;
}

export function QuestionNavigation({
  questions,
  currentIndex,
  questionStates,
  onQuestionSelect,
}: QuestionNavigationProps) {
  return (
    <div className="h-full bg-card border-r">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Questions</h2>
        <p className="text-sm text-muted-foreground">
          {questions.length} questions total
        </p>
      </div>
      <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-10rem)]">
        {questions.map((question, index) => {
          const questionState = questionStates.find(
            (state) => state.id === question.id
          ) || {
            id: question.id,
            isFlagged: false,
            isAnswered: false,
          };

          return (
            <QuestionItem
              key={question.id}
              index={index}
              isActive={currentIndex === index}
              isFlagged={questionState.isFlagged}
              isAnswered={questionState.isAnswered}
              onClick={() => onQuestionSelect(index)}
            />
          );
        })}
      </div>
    </div>
  );
}
