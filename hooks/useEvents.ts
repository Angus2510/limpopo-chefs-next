import { useState, useEffect } from "react";
import { Event } from "@/types/events/Events";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "@/lib/actions/events/getEvents";
import { toast } from "@/components/ui/use-toast";

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
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

  const handleEventAction = async (data: Partial<Event>) => {
    try {
      setIsLoading(true);

      if (modalMode === "edit" && selectedEvent) {
        await updateEvent(selectedEvent.id, data);
      } else {
        await createEvent(data);
      }

      await fetchEvents();
      setIsModalOpen(false);
      toast({
        title: "Success",
        description: `Event ${
          modalMode === "create" ? "created" : "updated"
        } successfully`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save event",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
    fetchEvents,
  };
}
