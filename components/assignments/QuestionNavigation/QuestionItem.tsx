import { Flag as FlagIcon } from "lucide-react";

interface QuestionItemProps {
  index: number;
  isActive: boolean;
  isFlagged: boolean;
  isAnswered: boolean;
  onClick: () => void;
}

export function QuestionItem({
  index,
  isActive,
  isFlagged,
  isAnswered,
  onClick,
}: QuestionItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
          w-full p-3 rounded-lg flex items-center justify-between
          transition-colors duration-200
          ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"}
          ${isAnswered ? "border-l-4 border-green-500" : ""}
        `}
    >
      <span className="flex items-center gap-2">
        <span className="font-medium">Q{index + 1}</span>
      </span>
      {isFlagged && (
        <span className="text-yellow-500">
          <FlagIcon className="h-4 w-4" />
        </span>
      )}
    </button>
  );
}
