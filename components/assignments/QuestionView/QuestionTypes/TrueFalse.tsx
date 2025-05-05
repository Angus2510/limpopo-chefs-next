interface TrueFalseProps {
  questionId: string;
  currentAnswer?: string;
  onChange: (questionId: string, value: string) => void;
}

export function TrueFalse({
  questionId,
  currentAnswer,
  onChange,
}: TrueFalseProps) {
  return (
    <div className="space-x-4">
      <label className="inline-flex items-center">
        <input
          type="radio"
          name={questionId}
          value="true"
          checked={currentAnswer === "true"}
          onChange={(e) => onChange(questionId, e.target.value)}
          className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
        />
        <span className="ml-2">True</span>
      </label>
      <label className="inline-flex items-center">
        <input
          type="radio"
          name={questionId}
          value="false"
          checked={currentAnswer === "false"}
          onChange={(e) => onChange(questionId, e.target.value)}
          className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
        />
        <span className="ml-2">False</span>
      </label>
    </div>
  );
}
