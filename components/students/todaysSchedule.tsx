import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";

interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
  location?: string;
  type: "CLASS" | "MEETING" | "ASSIGNMENT" | "OTHER";
  assignedTo: string[];
}

interface Student {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

interface TodaysScheduleProps {
  studentData: Student;
  events: Event[];
}

export function TodaysSchedule({ studentData, events }: TodaysScheduleProps) {
  const [todaysEvents, setTodaysEvents] = React.useState<Event[]>([]);

  React.useEffect(() => {
    const filterTodaysEvents = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return events
        .filter((event) => {
          const eventDate = new Date(event.startTime);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate.getTime() === today.getTime();
        })
        .sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
    };

    setTodaysEvents(filterTodaysEvents());
  }, [events]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get event type badge color
  const getEventTypeColor = (type: Event["type"]) => {
    switch (type) {
      case "CLASS":
        return "bg-blue-100 text-blue-800";
      case "MEETING":
        return "bg-green-100 text-green-800";
      case "ASSIGNMENT":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Today&apos;s Schedule</CardTitle>
        <CardDescription>Your daily agenda at a glance.</CardDescription>
      </CardHeader>
      <CardContent>
        {todaysEvents.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            No events scheduled for today
          </div>
        ) : (
          <ul className="space-y-4">
            {todaysEvents.map((event) => (
              <li key={event.id} className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-sm text-primary">
                    {formatTime(event.startTime)}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getEventTypeColor(
                      event.type
                    )}`}
                  >
                    {event.type}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium">{event.title}</span>
                  {event.description && (
                    <p className="text-xs text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                  {event.location && (
                    <p className="text-xs text-muted-foreground">
                      📍 {event.location}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Last updated: {new Date().toLocaleString()}
      </CardFooter>
    </Card>
  );
}
