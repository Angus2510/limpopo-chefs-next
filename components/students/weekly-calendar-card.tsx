"use client";

import type React from "react";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
} from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Event {
  id: string;
  title: string;
  date: Date;
}

const WeeklyCalendarCard: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Sample events (you can replace this with your own data source)
  const [events] = useState<Event[]>([
    { id: "1", title: "Team Meeting", date: new Date(2023, 5, 5, 10, 0) },
    { id: "2", title: "Lunch with Client", date: new Date(2023, 5, 6, 12, 30) },
    { id: "3", title: "Project Deadline", date: new Date(2023, 5, 7, 17, 0) },
    { id: "4", title: "Conference Call", date: new Date(2023, 5, 8, 9, 0) },
    { id: "5", title: "Team Building", date: new Date(2023, 5, 9, 15, 0) },
    { id: "6", title: "Code Review", date: new Date(2023, 5, 5, 14, 0) },
    { id: "7", title: "Product Launch", date: new Date(2023, 5, 6, 10, 0) },
    { id: "8", title: "Training Session", date: new Date(2023, 5, 7, 11, 0) },
  ]);

  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.date, date));
  };

  return (
    <Card className="w-[450] max-w-4xl mx-auto">
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
        <div className="grid grid-cols-3 gap-4 mb-4">
          {weekDays.slice(0, 3).map((day, index) => renderDateCard(index))}
        </div>
        <div className="grid grid-cols-2 gap-4">
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
        className={`  overflow-hidden ${
          isSelected ? "ring-2 ring-primary" : ""
        }`}
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
                <div key={event.id} className="p-2 border-b last:border-b-0">
                  <p className="text-sm font-semibold">
                    {format(event.date, "HH:mm")}
                  </p>
                  <p className="text-sm">{event.title}</p>
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
