import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, getWeek } from "date-fns";

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

export function CalendarHeader({
  currentDate,
  onPrevWeek,
  onNextWeek,
}: CalendarHeaderProps) {
  const weekNumber = getWeek(currentDate);

  return (
    <div className="flex items-center justify-between pb-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevWeek}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <span className="text-sm text-muted-foreground">
            Week {weekNumber}
          </span>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={onNextWeek}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
