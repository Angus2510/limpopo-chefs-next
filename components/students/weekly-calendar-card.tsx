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
  getWeek,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getEvents } from "@/lib/actions/events/getEvents";
import { Event, EventType, EVENT_TYPES } from "@/types/events/Events";

interface WeeklyCalendarProps {
  studentData: {
    intakeGroup: string[];
    campus: string[];
    campusTitle: string;
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
        const allEvents = await getEvents();
        const filtered = allEvents.filter((event) => {
          if (!event || !event.campus || !event.assignedToModel) return false;
          const isAssignedToGroup = event.assignedToModel.includes(
            studentData.intakeGroup[0]
          );
          const isCampusMatch =
            event.campus?.toLowerCase() ===
            studentData.campusTitle.toLowerCase();
          return isAssignedToGroup && isCampusMatch;
        });
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
  }, [studentData.intakeGroup, studentData.campusTitle]);

  const getEventsForDate = (date: Date) => {
    return events
      .filter((event) => {
        const eventDate = new Date(event.startDate);
        return format(eventDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
      })
      .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
  };

  const formatTime = (time: string) => {
    return time || "00:00"; // Returns time in 24-hour format
  };

  const getEventColorClass = (eventType: EventType) => {
    return EVENT_TYPES[eventType];
  };

  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const currentWeekNumber = getWeek(currentDate);

  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

  const EventCard = ({ event }: { event: Event }) => (
    <li key={event.id} className="p-2 border rounded-md bg-secondary/20">
      <div className="flex flex-col space-y-1.5">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{event.title}</span>
            <span className="text-xs font-medium">
              {formatTime(event.startTime)} - {formatTime(event.endTime || "")}
            </span>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full ${getEventColorClass(
              event.color
            )}`}
          >
            {event.color}
          </span>
        </div>
        {event.details && (
          <p className="text-xs text-muted-foreground">{event.details}</p>
        )}
        <div className="text-xs space-y-1 text-muted-foreground">
          <p>👨‍🏫 {event.lecturer || "No lecturer assigned"}</p>
          <p>📍 {event.venue || "No venue specified"}</p>
          <p>🏢 {event.campus || "No campus specified"}</p>
        </div>
      </div>
    </li>
  );

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
      <CardHeader className="flex flex-col space-y-2 pb-2">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <CardTitle className="text-xl font-medium">
              {format(startOfCurrentWeek, "MMMM d, yyyy")}
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              Week {currentWeekNumber} of {format(currentDate, "yyyy")}
            </span>
          </div>
          <div className="space-x-2">
            <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
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
                          <EventCard key={event.id} event={event} />
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
                          <EventCard key={event.id} event={event} />
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
