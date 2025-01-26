"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  addDays,
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DayCell } from "./day-cell";

interface Event {
  id: string;
  date: string;
  title: string;
  color: string;
}

export default function CalendarDemo() {
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const [events, setEvents] = React.useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [newEvent, setNewEvent] = React.useState<Omit<Event, "id" | "date">>({
    title: "",
    color: "blue",
  });

  // Handlers for navigating between months
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Handler for clicking on a date
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  // Handler for adding a new event
  const handleAddEvent = () => {
    if (selectedDate && newEvent.title) {
      const newEventWithId: Event = {
        id: Math.random().toString(36).substr(2, 9),
        date: format(selectedDate, "yyyy-MM-dd"),
        title: newEvent.title,
        color: newEvent.color,
      };
      setEvents((prev) => [...prev, newEventWithId]);
      setNewEvent({ title: "", color: "blue" });
    }
  };

  // Memoize date calculations to avoid recalculating on every render
  const monthStart = React.useMemo(
    () => startOfMonth(currentDate),
    [currentDate]
  );
  const monthEnd = React.useMemo(() => endOfMonth(currentDate), [currentDate]);
  const calendarStart = React.useMemo(
    () => startOfWeek(monthStart),
    [monthStart]
  );
  const calendarEnd = React.useMemo(() => endOfWeek(monthEnd), [monthEnd]);

  // Memoize the calendarDays array to avoid recalculating on each render
  const calendarDays: Date[] = React.useMemo(() => {
    const days: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [calendarStart, calendarEnd]);

  return (
    <div className="h-screen flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <Button onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-semibold">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 flex-grow">
        {calendarDays.map((day) => (
          <DayCell
            key={day.toISOString()}
            date={day}
            events={events.filter((event) =>
              isSameDay(parseISO(event.date), day)
            )}
            isCurrentMonth={isSameMonth(day, currentDate)}
            onDateClick={handleDateClick}
          />
        ))}
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Event for{" "}
              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Event title"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <Select
              value={newEvent.color}
              onValueChange={(color) =>
                setNewEvent((prev) => ({ ...prev, color }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="red">Red</SelectItem>
                <SelectItem value="yellow">Yellow</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddEvent}>Add Event</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
