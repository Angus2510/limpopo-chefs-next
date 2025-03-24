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
  startDate: string;
  startTime: string;
  campus: string;
  venue: string;
  assignedToModel: string[];
  color: string;
}

interface TodaysScheduleProps {
  studentId: string;
  intakeGroup?: string;
  campus: string[]; // Changed to string array since that's what we're getting
  campusTitle?: string; // Add this for the actual campus name
}

export function TodaysSchedule({
  intakeGroup,
  campus,
  campusTitle,
}: TodaysScheduleProps) {
  const [todaysEvents, setTodaysEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAndFilterEvents = async () => {
      try {
        const allEvents = await getEvents();
        console.log("Raw events:", allEvents);

        const filteredEvents = allEvents.filter((event) => {
          if (!event || !campusTitle) return false;

          const eventCampus = event.campus?.toLowerCase();
          const studentCampus = campusTitle.toLowerCase();
          const campusMatch = eventCampus === studentCampus;
          const groupMatch = event.assignedToModel?.includes(intakeGroup || "");

          console.log("Checking event:", {
            eventTitle: event.title,
            eventCampus,
            studentCampus,
            campusMatch,
            groupMatch,
            eventGroups: event.assignedToModel,
            studentGroup: intakeGroup,
          });

          return campusMatch && groupMatch;
        });

        console.log("Filtered events:", filteredEvents);
        setTodaysEvents(filteredEvents);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (campusTitle && intakeGroup) {
      fetchAndFilterEvents();
    }
  }, [intakeGroup, campusTitle]);

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(":");
      const date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return time;
    }
  };

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
        <CardDescription>Your daily agenda at a glance</CardDescription>
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
                    {formatTime(event.startTime)}
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
                  {event.venue && (
                    <p className="text-xs text-muted-foreground">
                      📍 {event.venue}
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
