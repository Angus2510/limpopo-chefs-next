import { format, isSameDay, parseISO } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Event } from "../../types";
import { EventItem } from "./EventItem";

interface DayCellProps {
  date: Date;
  events: Event[];
  isCurrentMonth: boolean;
  onClick: () => void;
  onEventClick: (event: Event) => void;
}

export function DayCell({
  date,
  events,
  isCurrentMonth,
  onClick,
  onEventClick,
}: DayCellProps) {
  const dayEvents = events.filter((event) => {
    const eventDate =
      typeof event.startDate === "string"
        ? parseISO(event.startDate)
        : event.startDate;
    return isSameDay(eventDate, date);
  });

  return (
    <div
      className={cn(
        "min-h-[120px] p-2 border border-gray-200",
        isCurrentMonth ? "bg-white" : "bg-gray-50",
        "hover:bg-gray-50 transition-colors"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-1">
        <span
          className={cn(
            "text-sm font-semibold",
            !isCurrentMonth && "text-gray-400"
          )}
        >
          {format(date, "d")}
        </span>
        <span className="text-xs text-gray-500">{format(date, "EEE")}</span>
      </div>

      <ScrollArea className="h-[80px]">
        <div className="space-y-1">
          {dayEvents.map((event) => (
            <EventItem
              key={event.id}
              event={event}
              onClick={() => onEventClick(event)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
