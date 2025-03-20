"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  parseISO,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getEvents } from "@/lib/actions/events/getEvents";
import { Event, EventType, EVENT_TYPES } from "@/types/events/Events";

interface WeeklyCalendarProps {
  studentData: {
    intakeGroup: string[];
  };
}

const WeeklyCalendarCard: React.FC<WeeklyCalendarProps> = ({ studentData }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log(
          "🔍 Fetching events for weekly calendar:",
          studentData.intakeGroup[0]
        );
        const allEvents = await getEvents();
        console.log("📦 Retrieved events:", allEvents.length);

        const filtered = allEvents.filter((event) => {
          const isAssignedToGroup = event.assignedToModel.includes(
            studentData.intakeGroup[0]
          );
          console.log("🔎 Checking event:", {
            eventId: event.id,
            eventTitle: event.title,
            assignedTo: event.assignedToModel,
            intakeGroup: studentData.intakeGroup[0],
            isAssigned: isAssignedToGroup,
          });
          return isAssignedToGroup;
        });

        console.log("✅ Filtered events:", filtered.length);
        setEvents(filtered);
      } catch (error) {
        console.error("❌ Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    if (studentData.intakeGroup?.length) {
      fetchEvents();
    }
  }, [studentData.intakeGroup]);

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return format(eventDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
    });
  };

  const formatTime = (date: Date, time: string) => {
    const [hours, minutes] = time.split(":");
    const dateTime = new Date(date);
    dateTime.setHours(parseInt(hours), parseInt(minutes));

    return dateTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getEventColorClass = (eventType: EventType) => {
    return EVENT_TYPES[eventType];
  };

  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent>
          <div className="text-center py-4">Loading calendar...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-medium">
          Week of {format(startOfCurrentWeek, "MMMM d, yyyy")}
        </CardTitle>
        <div className="space-x-2">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {weekDays.slice(0, 3).map((day, index) => {
            const date = addDays(startOfCurrentWeek, index);
            const dateEvents = getEventsForDate(date);
            return (
              <Card key={day} className="overflow-hidden">
                <CardHeader className="p-3">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>{day}</span>
                    <span>{format(date, "d")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-40 w-full">
                    {dateEvents.length > 0 ? (
                      <ul className="space-y-2 p-2">
                        {dateEvents.map((event) => (
                          <li key={event.id}>
                            <div className="flex flex-col space-y-1">
                              <div className="flex justify-between items-start">
                                <span className="text-sm font-medium">
                                  {formatTime(event.startDate, event.startTime)}
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${getEventColorClass(
                                    event.color
                                  )}`}
                                >
                                  {event.title}
                                </span>
                              </div>
                              {event.details && (
                                <p className="text-xs text-muted-foreground">
                                  {event.details}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                📍 {event.venue}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="p-2 text-sm text-muted-foreground">
                        No events
                      </p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weekDays.slice(3, 5).map((day, index) => {
            const date = addDays(startOfCurrentWeek, index + 3);
            const dateEvents = getEventsForDate(date);
            return (
              <Card key={day} className="overflow-hidden">
                <CardHeader className="p-3">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>{day}</span>
                    <span>{format(date, "d")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-40 w-full">
                    {dateEvents.length > 0 ? (
                      <ul className="space-y-2 p-2">
                        {dateEvents.map((event) => (
                          <li key={event.id}>
                            <div className="flex flex-col space-y-1">
                              <div className="flex justify-between items-start">
                                <span className="text-sm font-medium">
                                  {formatTime(event.startDate, event.startTime)}
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${getEventColorClass(
                                    event.color
                                  )}`}
                                >
                                  {event.title}
                                </span>
                              </div>
                              {event.details && (
                                <p className="text-xs text-muted-foreground">
                                  {event.details}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                📍 {event.venue}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="p-2 text-sm text-muted-foreground">
                        No events
                      </p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyCalendarCard;
