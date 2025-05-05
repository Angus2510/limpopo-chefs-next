import { QuestionOption } from "@/types/assignments/assignments";

interface MultipleChoiceProps {
  questionId: string;
  options: QuestionOption[];
  currentAnswer?: string;
  onChange: (questionId: string, value: string) => void;
}

export function MultipleChoice({
  questionId,
  options,
  currentAnswer,
  onChange,
}: MultipleChoiceProps) {
  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label key={option.id} className="flex items-center space-x-2">
          <input
            type="radio"
            name={questionId}
            value={option.value}
            checked={currentAnswer === option.value}
            onChange={(e) => onChange(questionId, e.target.value)}
            className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
          />
          <span>{option.value}</span>
        </label>
      ))}
    </div>
  );
}
