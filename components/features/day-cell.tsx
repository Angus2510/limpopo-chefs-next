import * as React from "react"
import { format } from "date-fns"

interface Event {
  id: string
  title: string
  color: string
}

interface DayCellProps {
  date: Date
  events: Event[]
  isCurrentMonth: boolean
  onDateClick: (date: Date) => void
}

export function DayCell({ date, events, isCurrentMonth, onDateClick }: DayCellProps) {
  return (
    <div
      className={`h-24 p-1 border ${isCurrentMonth ? "bg-white" : "bg-gray-100"} relative cursor-pointer`}
      onClick={() => onDateClick(date)}
    >
      <div className={`font-semibold text-sm ${isCurrentMonth ? "text-gray-900" : "text-gray-400"}`}>
        {format(date, "d")}
      </div>
      <div className="mt-1 space-y-1">
        {events.map((event) => (
          <div
            key={event.id}
            className={`text-xs p-1 rounded truncate ${
              event.color === "blue"
                ? "bg-blue-200 text-blue-800"
                : event.color === "green"
                  ? "bg-green-200 text-green-800"
                  : event.color === "red"
                    ? "bg-red-200 text-red-800"
                    : "bg-yellow-200 text-yellow-800"
            }`}
          >
            {event.title}
          </div>
        ))}
      </div>
    </div>
  )
}

