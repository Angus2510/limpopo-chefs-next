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

  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      const data = await getEvents();
      if (Array.isArray(data)) {
        setEvents(data);
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
      // Ensure we have a start date from the selected date
      const payload = {
        ...eventData,
        startDate: selectedDate?.toISOString() || new Date().toISOString(),
      };

      await handleEventAction(payload);

      // Refresh events after successful action
      const updatedEvents = await getEvents();
      if (Array.isArray(updatedEvents)) {
        setEvents(updatedEvents);
      }

      // Reset state
      setIsModalOpen(false);
      setSelectedDate(null);
      setSelectedEvent(null);
    } catch (error) {
      console.error("Failed to handle event action:", error);
    }
  };

  const handleEventDelete = async () => {
    if (!selectedEvent) return;

    try {
      setModalMode("delete");
      await handleEventAction({});

      // Refresh events after deletion
      const updatedEvents = await getEvents();
      if (Array.isArray(updatedEvents)) {
        setEvents(updatedEvents);
      }

      // Reset state
      setIsModalOpen(false);
      setSelectedDate(null);
      setSelectedEvent(null);
    } catch (error) {
      console.error("Failed to delete event:", error);
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
