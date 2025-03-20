import { isSameMonth } from "date-fns";
import { DayCell } from "./DayCell";
import { Event } from "@/types/events/Events";

interface CalendarGridProps {
  currentDate: Date;
  calendarDays: Date[];
  events: Event[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: Event) => void;
}

export function CalendarGrid({
  currentDate,
  calendarDays,
  events,
  onDayClick,
  onEventClick,
}: CalendarGridProps) {
  return (
    <div className="flex-1 grid grid-cols-7 grid-rows-[auto_1fr] gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
      {/* Week day headers */}
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
        <div
          key={day}
          className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-500"
        >
          {day}
        </div>
      ))}

      {/* Calendar days */}
      {calendarDays.map((date) => (
        <DayCell
          key={date.toISOString()}
          date={date}
          events={events}
          isCurrentMonth={isSameMonth(date, currentDate)}
          onClick={() => onDayClick(date)}
          onEventClick={onEventClick}
        />
      ))}
    </div>
  );
}
