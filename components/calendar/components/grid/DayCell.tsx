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
  intakeGroups: { id: string; title: string }[];
}
export function DayCell({
  date,
  events,
  isCurrentMonth,
  onClick,
  onEventClick,
  intakeGroups,
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
        "min-h-[200px] p-4 border border-gray-200",
        isCurrentMonth ? "bg-white" : "bg-gray-50",
        "hover:bg-gray-50 transition-colors"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-3">
        <span
          className={cn(
            "text-lg font-semibold",
            !isCurrentMonth && "text-gray-400"
          )}
        >
          {format(date, "d")}
        </span>
        <span className="text-sm text-gray-500">{format(date, "EEE")}</span>
      </div>

      <ScrollArea className="h-[calc(100%-2rem)]">
        <div className="space-y-2">
          {dayEvents.map((event) => (
            <EventItem
              key={event.id}
              event={event}
              onClick={() => onEventClick(event)}
              intakeGroups={intakeGroups}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
