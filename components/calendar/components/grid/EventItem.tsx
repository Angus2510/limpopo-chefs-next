import { cn } from "@/lib/utils";
import { Event, EVENT_TYPES } from "@/types/events/Events";
import { useEffect, useState } from "react";
import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";

interface EventItemProps {
  event: Event;
  onClick: () => void;
}

export function EventItem({ event, onClick }: EventItemProps) {
  const [groupTitles, setGroupTitles] = useState<string[]>([]);
  const capitalizedCampus = event.campus
    ? event.campus.charAt(0).toUpperCase() + event.campus.slice(1)
    : "";

  useEffect(() => {
    const fetchGroupTitles = async () => {
      if (!event.assignedToModel?.length) return;

      try {
        const groups = await getAllIntakeGroups();
        const titles = event.assignedToModel
          .map((id) => groups.find((group) => group.id === id)?.title)
          .filter((title) => title) as string[];

        setGroupTitles(titles);
      } catch (error) {
        console.error("Failed to fetch intake group titles:", error);
      }
    };

    fetchGroupTitles();
  }, [event.assignedToModel]);

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
      <div className="text-[10px] truncate">⏰ {event.startTime}</div>
      {groupTitles.length > 0 && (
        <div className="text-[10px] truncate">👥 {groupTitles.join(", ")}</div>
      )}
      {event.lecturer && (
        <div className="text-[10px] truncate">👨‍🏫 {event.lecturer}</div>
      )}
      {event.campus && (
        <div className="text-[10px] truncate">📍 {capitalizedCampus}</div>
      )}
      {event.venue && (
        <div className="text-[10px] truncate">🏛️ {event.venue}</div>
      )}
    </div>
  );
}
