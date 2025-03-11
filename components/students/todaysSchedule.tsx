import * as React from "react";
import { getEvents } from "@/lib/actions/events/getEvents";
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
  details: string;
  startDate: string; // ISO string
  endDate: string | null; // ISO string
  color: string;
  location: string[];
  assignedTo: string[];
  assignedToModel: string[];
  createdBy: string;
  v: number;
  allDay: boolean;
}

interface TodaysScheduleProps {
  studentId: string;
  intakeGroup?: string; // Add intake group
}

export function TodaysSchedule({
  studentId,
  intakeGroup,
}: TodaysScheduleProps) {
  const [todaysEvents, setTodaysEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAndFilterEvents = async () => {
      try {
        console.log("🔍 Fetching events for student:", {
          studentId,
          intakeGroup,
        });
        const allEvents = await getEvents();
        console.log("📦 Retrieved events:", allEvents.length);

        // Filter for today's events assigned to this student's intake group
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const filteredEvents = allEvents
          .filter((event) => {
            // Check if event is assigned to student's intake group
            const isAssignedToGroup =
              intakeGroup && event.assignedToModel.includes(intakeGroup);
            console.log("🔎 Checking event:", {
              eventId: event.id,
              eventTitle: event.title,
              assignedTo: event.assignedToModel,
              intakeGroup,
              isAssigned: isAssignedToGroup,
            });

            // Check if event is today
            const eventDate = new Date(event.startDate);
            eventDate.setHours(0, 0, 0, 0);
            const isToday = eventDate.getTime() === today.getTime();
            console.log("📅 Date check:", {
              eventDate: eventDate.toISOString(),
              today: today.toISOString(),
              isToday,
            });

            return isAssignedToGroup && isToday;
          })
          .sort(
            (a, b) =>
              new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          );

        console.log("✅ Filtered events:", filteredEvents.length);
        setTodaysEvents(filteredEvents);
      } catch (error) {
        console.error("❌ Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    if (intakeGroup) {
      fetchAndFilterEvents();
    }
  }, [studentId, intakeGroup]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get event color class
  const getEventColorClass = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-800";
      case "green":
        return "bg-green-100 text-green-800";
      case "yellow":
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
        {loading ? (
          <div className="text-center text-muted-foreground py-4">
            Loading schedule...
          </div>
        ) : todaysEvents.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            No events scheduled for today
          </div>
        ) : (
          <ul className="space-y-4">
            {todaysEvents.map((event) => (
              <li key={event.id} className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-sm text-primary">
                    {formatTime(event.startDate)}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getEventColorClass(
                      event.color
                    )}`}
                  >
                    {event.title}
                  </span>
                </div>
                <div className="space-y-1">
                  {event.details && (
                    <p className="text-xs text-muted-foreground">
                      {event.details}
                    </p>
                  )}
                  {event.location && event.location.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      📍 {event.location.join(", ")}
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
