"use client";

import { CalendarHeader } from "./components/header/CalendarHeader";
import { CalendarLegend } from "./components/header/CalendarLedgend";
import { CalendarGrid } from "./components/grid/CalendarGrid";
import { EventDialog } from "./components/dialog/EventDialog";
import { useCalendar } from "@/hooks/useCalendar";
import { useEvents } from "@/hooks/useEvents";
import { CalendarProps, Event } from "@/types/events/Events";
import { useEffect } from "react";
import { getEvents } from "@/lib/actions/events/getEvents";
import { toast } from "@/components/ui/use-toast";

export function Calendar({ intakeGroups }: CalendarProps) {
  const { currentDate, calendarDays, navigateMonth } = useCalendar();
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
  } = useEvents();

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await getEvents();
      if (response.success) {
        setEvents(response.data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load events",
        });
      }
    };
    fetchEvents();
  }, [setEvents]);

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

      const response = await handleEventAction(payload);

      if (response.success) {
        const updatedEvents = await getEvents();
        if (response.success) {
          setEvents(response.data);
          toast({
            title: modalMode === "create" ? "Event Created" : "Event Updated",
            description: "Calendar has been updated successfully.",
          });
        }

        setIsModalOpen(false);
        setSelectedDate(null);
        setSelectedEvent(null);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error || "Failed to save event",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    }
  };

  const handleEventDelete = async () => {
    if (!selectedEvent) return;

    try {
      setModalMode("delete");
      const response = await handleEventAction({});

      if (response.success) {
        const updatedEvents = await getEvents();
        if (response.success) {
          setEvents(response.data);
          toast({
            title: "Event Deleted",
            description: "The event has been removed from the calendar.",
          });
        }

        setIsModalOpen(false);
        setSelectedDate(null);
        setSelectedEvent(null);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error || "Failed to delete event",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="space-y-4">
        <CalendarHeader
          currentDate={currentDate}
          onPrevMonth={() => navigateMonth("prev")}
          onNextMonth={() => navigateMonth("next")}
        />
        <CalendarLegend />
      </div>

      <CalendarGrid
        currentDate={currentDate}
        calendarDays={calendarDays}
        events={events}
        onDayClick={handleDayClick}
        onEventClick={handleEventClick}
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
