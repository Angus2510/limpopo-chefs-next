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
  isSameDay,
  parseISO,
} from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface WeeklyCalendarProps {
  studentData: Student;
  events: Event[];
}

const WeeklyCalendarCard: React.FC<WeeklyCalendarProps> = ({
  studentData,
  events,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [processedEvents, setProcessedEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (events) {
      setProcessedEvents(events);
    }
  }, [events]);

  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

  const getEventsForDate = (date: Date) => {
    return processedEvents.filter((event) =>
      isSameDay(parseISO(event.startTime), date)
    );
  };

  // Get event type color
  const getEventTypeColor = (type: Event["type"]) => {
    switch (type) {
      case "CLASS":
        return "bg-blue-50 border-l-4 border-blue-500";
      case "MEETING":
        return "bg-green-50 border-l-4 border-green-500";
      case "ASSIGNMENT":
        return "bg-yellow-50 border-l-4 border-yellow-500";
      default:
        return "bg-gray-50 border-l-4 border-gray-500";
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-medium">
          Week of {format(startOfCurrentWeek, "MMMM d, yyyy")}
        </CardTitle>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousWeek}
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextWeek}
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {weekDays.slice(0, 3).map((day, index) => renderDateCard(index))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weekDays.slice(3, 5).map((day, index) => renderDateCard(index + 3))}
        </div>
      </CardContent>
    </Card>
  );

  function renderDateCard(index: number) {
    const date = addDays(startOfCurrentWeek, index);
    const isSelected = isSameDay(date, selectedDate);
    const dateEvents = getEventsForDate(date);

    return (
      <Card
        key={weekDays[index]}
        className={`overflow-hidden ${isSelected ? "ring-2 ring-primary" : ""}`}
        onClick={() => setSelectedDate(date)}
      >
        <CardHeader className="p-3">
          <CardTitle className="text-lg flex justify-between items-center">
            <span>{weekDays[index]}</span>
            <span>{format(date, "d")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-40 w-full">
            {dateEvents.length > 0 ? (
              dateEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-2 ${getEventTypeColor(
                    event.type
                  )} hover:bg-opacity-75 transition-colors`}
                >
                  <p className="text-sm font-semibold">
                    {format(parseISO(event.startTime), "HH:mm")}
                  </p>
                  <p className="text-sm font-medium">{event.title}</p>
                  {event.location && (
                    <p className="text-xs text-muted-foreground">
                      📍 {event.location}
                    </p>
                  )}
                  {event.description && (
                    <p className="text-xs text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="p-2 text-sm text-muted-foreground">No events</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }
};

export default WeeklyCalendarCard;
