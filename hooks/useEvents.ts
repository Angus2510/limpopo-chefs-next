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
  const [modalMode, setModalMode] = useState<"create" | "edit" | "delete">(
    "create"
  );

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(Array.isArray(data) ? data : []);
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

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await deleteEvent(id);

      if (response.success) {
        await fetchEvents();
        setIsModalOpen(false);
        setSelectedEvent(null);
        toast({
          title: "Success",
          description: "Event deleted successfully",
        });
        return true;
      }
      throw new Error(response.error);
    } catch (error) {
      console.error("Delete failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete event",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventAction = async (data: Partial<Event>) => {
    try {
      setIsLoading(true);

      if (modalMode === "edit" && selectedEvent?.id) {
        await updateEvent(selectedEvent.id, data);
      } else {
        await createEvent(data);
      }

      await fetchEvents();
      toast({
        title: "Success",
        description: `Event ${
          modalMode === "create" ? "created" : "updated"
        } successfully`,
      });
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to perform action",
      });
      return false;
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
    handleDelete,
    fetchEvents,
  };
}
