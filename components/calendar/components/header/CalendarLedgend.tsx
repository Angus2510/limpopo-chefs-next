import { Badge } from "@/components/ui/badge";
import { EVENT_TYPES, EventType } from "@/types/events/Events";

export function CalendarLegend() {
  return (
    <div className="flex flex-wrap gap-2 pb-4">
      {(Object.entries(EVENT_TYPES) as [EventType, string][]).map(
        ([type, className]) => (
          <Badge
            key={type}
            variant="outline"
            className={`${className} capitalize`}
          >
            {type.replace("_", " ")}
          </Badge>
        )
      )}
    </div>
  );
}
