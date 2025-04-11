import { isSameMonth, startOfWeek, addDays } from "date-fns";
import { DayCell } from "./DayCell";
import { Event } from "@/types/events/Events";

interface CalendarGridProps {
  currentDate: Date;
  events: Event[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: Event) => void;
  intakeGroups: any[]; // Add proper type
}

export function CalendarGrid({
  currentDate,
  events,
  onDayClick,
  onEventClick,
  intakeGroups,
}: CalendarGridProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="flex-1 grid grid-rows-[auto_1fr] gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden h-[calc(100vh-12rem)]">
      {/* Week day headers */}
      <div className="grid grid-cols-5">
        {" "}
        {/* Change from grid-cols-7 to grid-cols-5 */}
        {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
          <div
            key={day}
            className="bg-gray-50 p-4 text-center text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Update the calendar days grid */}
      <div className="grid grid-cols-1 md:grid-cols-5">
        {" "}
        {/* Change from grid-cols-7 to grid-cols-5 */}
        {weekDays
          .slice(0, 5) // Only take first 5 days
          .map((date) => (
            <DayCell
              key={date.toISOString()}
              date={date}
              events={events}
              isCurrentMonth={isSameMonth(date, currentDate)}
              onClick={() => onDayClick(date)}
              onEventClick={onEventClick}
              intakeGroups={intakeGroups}
            />
          ))}
      </div>
    </div>
  );
}
