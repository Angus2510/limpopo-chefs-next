"use client";

import { CalendarHeader } from "./components/header/CalendarHeader";
import { CalendarLegend } from "./components/header/CalendarLedgend";
import { CalendarGrid } from "./components/grid/CalendarGrid";
import { EventDialog } from "./components/dialog/EventDialog";
import { useEvents } from "@/hooks/useEvents";
import { CalendarProps, Event } from "@/types/events/Events";
import { useEffect, useState } from "react";
import { getEvents } from "@/lib/actions/events/getEvents";
import { toast } from "@/components/ui/use-toast";
import { addWeeks, subWeeks } from "date-fns";

interface CalendarProps {
  intakeGroups: {
    id: string;
    title: string;
  }[];
}

export function Calendar({ intakeGroups }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const {
    events,
    selectedEvent,
    selectedDate,
    isModalOpen,
    isLoading,
    modalMode,
    setEvents,
    setSelectedEvent,
    setSelectedDate,
    setIsModalOpen,
    setModalMode,
    handleEventAction,
    handleDelete,
  } = useEvents();

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate((prevDate) =>
      direction === "prev" ? subWeeks(prevDate, 1) : addWeeks(prevDate, 1)
    );
  };

  const fetchEvents = async () => {
    try {
      const events = await getEvents();
      if (Array.isArray(events)) {
        setEvents(events);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load events",
      });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setModalMode("create");
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleEventSubmit = async (eventData: Partial<Event>) => {
    try {
      const payload = {
        ...eventData,
        startDate: selectedDate?.toISOString() || new Date().toISOString(),
      };

      const success = await handleEventAction(payload);

      if (success) {
        await fetchEvents();
        setIsModalOpen(false);
        setSelectedDate(null);
        setSelectedEvent(null);

        toast({
          title: "Success",
          description: `Event ${
            modalMode === "create" ? "created" : "updated"
          } successfully`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save event",
      });
    }
  };

  const handleEventDelete = async () => {
    if (!selectedEvent?.id) return;

    try {
      await handleDelete(selectedEvent.id);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const sortEventsByTime = (events: Event[]) => {
    return [...events].sort((a, b) => {
      // First compare by date
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      const dateCompare = dateA.getTime() - dateB.getTime();

      if (dateCompare !== 0) return dateCompare;

      // If same date, compare by time
      return a.startTime.localeCompare(b.startTime);
    });
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="space-y-4">
        <CalendarHeader
          currentDate={currentDate}
          onPrevWeek={() => navigateWeek("prev")}
          onNextWeek={() => navigateWeek("next")}
        />
        <CalendarLegend />
      </div>

      <CalendarGrid
        currentDate={currentDate}
        events={sortEventsByTime(events)}
        onDayClick={handleDayClick}
        onEventClick={handleEventClick}
        intakeGroups={intakeGroups}
      />

      <EventDialog
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDate(null);
          setSelectedEvent(null);
        }}
        selectedDate={selectedDate}
        selectedEvent={selectedEvent}
        intakeGroups={intakeGroups}
        mode={modalMode}
        isLoading={isLoading}
        onSubmit={handleEventSubmit}
        onDelete={handleEventDelete}
      />
    </div>
  );
}
