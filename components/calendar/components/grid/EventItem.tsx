import { cn } from "@/lib/utils";
import { Event, EVENT_TYPES } from "@/types/events/Events";

interface EventItemProps {
  event: Event;
  onClick: () => void;
}

export function EventItem({ event, onClick }: EventItemProps) {
  return (
    <div
      role="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "px-2 py-1 rounded-sm text-xs cursor-pointer",
        EVENT_TYPES[event.color],
        "hover:opacity-80 transition-opacity"
      )}
    >
      <div className="font-medium truncate">{event.title}</div>
      <div className="text-[10px] truncate">{event.startTime}</div>
    </div>
  );
}
