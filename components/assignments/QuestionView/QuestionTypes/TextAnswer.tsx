interface TextAnswerProps {
  questionId: string;
  type: "short-answer" | "long-answer";
  currentAnswer?: string;
  onChange: (questionId: string, value: string) => void;
  preventCopyPaste: (e: React.ClipboardEvent) => void;
}

export function TextAnswer({
  questionId,
  type,
  currentAnswer,
  onChange,
  preventCopyPaste,
}: TextAnswerProps) {
  return (
    <textarea
      value={currentAnswer || ""}
      onChange={(e) => onChange(questionId, e.target.value)}
      className="w-full p-2 border rounded"
      placeholder="Enter your answer here..."
      rows={type === "long-answer" ? 6 : 2}
      onCopy={preventCopyPaste}
      onPaste={preventCopyPaste}
      onCut={preventCopyPaste}
      autoComplete="off"
      spellCheck="false"
      data-form-type="other"
    />
  );
}
