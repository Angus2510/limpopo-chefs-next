import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";

interface TestControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  onFlag: () => void;
  isFirst: boolean;
  isLast: boolean;
  isFlagged: boolean;
}

export function TestControls({
  onPrevious,
  onNext,
  onFlag,
  isFirst,
  isLast,
  isFlagged,
}: TestControlsProps) {
  return (
    <div className="border-t p-4 flex items-center justify-between">
      <Button variant="outline" onClick={onPrevious} disabled={isFirst}>
        Previous
      </Button>
      <Button
        variant="outline"
        onClick={onFlag}
        className={isFlagged ? "text-yellow-500" : ""}
      >
        <Flag className="h-4 w-4 mr-2" />
        {isFlagged ? "Unflag" : "Flag"}
      </Button>
      <Button variant="outline" onClick={onNext} disabled={isLast}>
        Next
      </Button>
    </div>
  );
}
