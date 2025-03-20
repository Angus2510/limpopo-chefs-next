import { useState, useEffect } from "react";
import { Event, ModalMode } from "../types";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "@/lib/actions/events/getEvents";

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const data = await getEvents();
      if (Array.isArray(data)) {
        setEvents(
          data.map((event) => ({
            ...event,
            startDate: new Date(event.startDate),
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventAction = async (eventData: Partial<Event>) => {
    try {
      setIsLoading(true);

      if (modalMode === "delete" && selectedEvent) {
        await deleteEvent(selectedEvent.id);
        setEvents((current) =>
          current.filter((e) => e.id !== selectedEvent.id)
        );
        return;
      }

      if (modalMode === "edit" && selectedEvent) {
        const updated = await updateEvent(selectedEvent.id, eventData);
        setEvents((current) =>
          current.map((event) =>
            event.id === selectedEvent.id ? updated : event
          )
        );
      } else {
        const created = await createEvent(eventData);
        setEvents((current) => [...current, created]);
      }
    } catch (error) {
      console.error("Event action failed:", error);
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  return {
    events,
    selectedEvent,
    selectedDate,
    isModalOpen,
    isLoading,
    modalMode,
    setSelectedEvent,
    setSelectedDate,
    setIsModalOpen,
    setModalMode,
    handleEventAction,
  };
}
