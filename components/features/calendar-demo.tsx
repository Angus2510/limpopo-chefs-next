"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Search,
  Trash2,
  Edit,
  X,
} from "lucide-react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "@/lib/actions/events/getEvents";

import { useState } from "react"; // Add this import

// Interfaces
interface CalendarDemoProps {
  intakeGroups: {
    id: string;
    title: string;
    outcome?: string[];
  }[];
  outcomes: {
    id: string;
    title: string;
    type: string;
    hidden: boolean;
  }[];
}

interface Event {
  id: string;
  title: string;
  details: string;
  startDate: Date;
  startTime: string;
  endDate?: Date | null;
  endTime: string;
  venue: string;
  lecturer: string;
  color: string;
  location: string[];
  assignedTo: string[];
  assignedToModel: string[];
  createdBy: string;
  v: number;
  allDay: boolean;
}

// Constants
const eventTypes = {
  assessment: "bg-red-100 text-red-800 border-red-300",
  practical: "bg-yellow-100 text-yellow-800 border-yellow-300",
  video: "bg-blue-100 text-blue-800 border-blue-300",
  theory: "bg-green-100 text-green-800 border-green-300",
  other: "bg-gray-100 text-gray-800 border-gray-300",
};

// DayCell Component
function DayCell({
  date,
  events,
  onClick,
  isCurrentMonth,
  onEventClick,
}: {
  date: Date;
  events: Event[];
  onClick: () => void;
  isCurrentMonth: boolean;
  onEventClick: (event: Event) => void;
}) {
  const dayEvents = events.filter((event) => {
    const eventDate =
      typeof event.startDate === "string"
        ? parseISO(event.startDate)
        : new Date(event.startDate);
    return isSameDay(eventDate, date);
  });

  return (
    <div
      className={cn(
        "h-[150px] p-2 border border-gray-200 cursor-pointer",
        isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400",
        "hover:bg-gray-50 transition-colors"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="font-semibold">{format(date, "d")}</span>
        <span className="text-xs text-gray-500">{format(date, "EEE")}</span>
      </div>
      <ScrollArea className="h-[110px]">
        {dayEvents.map((event) => (
          <div
            key={event.id}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(event);
            }}
            className={cn(
              eventTypes[event.color as keyof typeof eventTypes],
              "p-1 mb-1 rounded text-sm cursor-pointer hover:opacity-75",
              "flex justify-between items-center"
            )}
          >
            <span className="truncate">{event.title}</span>
            <div className="flex gap-1">
              <Edit className="h-4 w-4" />
              <Trash2 className="h-4 w-4" />
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}
// Main Calendar Component
export default function CalendarDemo({
  intakeGroups,
  outcomes,
}: CalendarDemoProps) {
  // States
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const [events, setEvents] = React.useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<
    "create" | "edit" | "delete"
  >("create");
  const [loading, setLoading] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [openPopover, setOpenPopover] = React.useState<"group" | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    details: "",
    startTime: "09:00",
    endTime: "17:00",
    venue: "",
    lecturer: "",
    color: "other",
    intakeGroups: [] as string[],
  });

  // Effects

  React.useEffect(() => {
    const fetchEvents = async () => {
      console.log("🎯 Starting fetchEvents");
      try {
        setLoading(true);
        const data = await getEvents();
        console.log("📦 Received data from server:", data);

        if (!Array.isArray(data)) {
          console.error("⚠️ Data is not an array:", data);
          setEvents([]);
          return;
        }

        const formattedEvents = data
          .filter((event) => event && event.startDate) // Ensure we have valid events
          .map((event) => {
            try {
              return {
                ...event,
                startDate: new Date(event.startDate),
                endDate: event.endDate ? new Date(event.endDate) : null,
              };
            } catch (err) {
              console.error("❌ Error formatting event:", event.id, err);
              return null;
            }
          })
          .filter(Boolean); // Remove any failed conversions

        console.log("✅ Formatted events:", formattedEvents.length);
        setEvents(formattedEvents);
      } catch (error) {
        console.error("❌ Error in fetchEvents:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Event Handlers
  const handleIntakeGroupChange = (groupId: string) => {
    setNewEvent((prev) => {
      const isSelected = prev.intakeGroups.includes(groupId);
      const updatedGroups = isSelected
        ? prev.intakeGroups.filter((id) => id !== groupId)
        : [...prev.intakeGroups, groupId];

      return {
        ...prev,
        intakeGroups: updatedGroups,
      };
    });

    setOpenPopover(null);
  };

  const handleEventAction = async () => {
    console.log("🎯 Starting event action:", modalMode);
    setIsLoading(true);

    try {
      // Handle Delete
      if (modalMode === "delete" && selectedEvent) {
        console.log("🗑️ Attempting to delete:", selectedEvent.id);
        const result = await deleteEvent(selectedEvent.id);
        if (result.success) {
          setEvents((current) =>
            current.filter((e) => e.id !== selectedEvent.id)
          );
          setIsModalOpen(false);
          setSelectedEvent(null);
        }
        return;
      }

      // Prepare event data
      const eventData = {
        title: newEvent.title,
        details: newEvent.details || "",
        startDate: selectedDate?.toISOString() || new Date().toISOString(),
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        venue: newEvent.venue,
        lecturer: newEvent.lecturer,
        color: newEvent.color || "other",
        assignedToModel: newEvent.intakeGroups,
      };

      // Handle Update or Create
      if (modalMode === "edit" && selectedEvent) {
        const updatedEvent = await updateEvent(selectedEvent.id, eventData);
        setEvents((current) =>
          current.map((event) =>
            event.id === selectedEvent.id
              ? { ...updatedEvent, startDate: new Date(updatedEvent.startDate) }
              : event
          )
        );
      } else {
        const createdEvent = await createEvent(eventData);
        setEvents((current) => [
          ...current,
          { ...createdEvent, startDate: new Date(createdEvent.startDate) },
        ]);
      }

      // Reset and close
      setNewEvent({
        title: "",
        details: "",
        startTime: "09:00",
        endTime: "17:00",
        venue: "",
        lecturer: "",
        color: "other",
        intakeGroups: [],
      });
      setIsModalOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error("❌ Event action failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the handleEventClick function
  const handleEventClick = (event: Event) => {
    console.log("🎯 Event clicked:", event.id);
    setSelectedEvent(event);
    setNewEvent({
      title: event.title,
      details: event.details || "",
      color: event.color || "other",
      intakeGroups: event.assignedToModel || [],
    });
    setModalMode("edit");
    setIsModalOpen(true);
  };
  // Calendar calculations
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = React.useMemo(() => {
    const days: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [calendarStart, calendarEnd]);

  if (loading) return <div>Loading calendar...</div>;

  return (
    <div className="h-screen flex flex-col p-4">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {Object.entries(eventTypes).map(([type, className]) => (
            <Badge key={type} variant="outline" className={className}>
              {type}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-[auto_1fr] gap-px bg-gray-200 border border-gray-200">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="bg-gray-50 p-2 text-center font-semibold">
            {day}
          </div>
        ))}

        {calendarDays.map((date) => (
          <DayCell
            key={date.toISOString()}
            date={date}
            events={events}
            isCurrentMonth={isSameMonth(date, currentDate)}
            onClick={() => {
              setSelectedDate(date);
              setModalMode("create");
              setNewEvent({
                title: "",
                details: "",
                color: "other",
                intakeGroups: [],
              });
              setIsModalOpen(true);
            }}
            onEventClick={handleEventClick}
          />
        ))}
      </div>

      {/* Event Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" ? "Add to Roster for " : "Edit Event on "}
              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 py-3">
            {/* Event Title & Details in one section */}
            <div className="space-y-2">
              <div className="grid gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter event title"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="details">Details</Label>
                <Textarea
                  id="details"
                  placeholder="Enter event details"
                  className="h-20"
                  value={newEvent.details}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, details: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Time, Venue, Lecturer section */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="startTime">Start</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, startTime: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="endTime">End</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, endTime: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  placeholder="Enter venue"
                  value={newEvent.venue}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, venue: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="lecturer">Lecturer</Label>
                <Input
                  id="lecturer"
                  placeholder="Enter lecturer name"
                  value={newEvent.lecturer}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, lecturer: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Event Type & Groups section */}
            <div className="space-y-2">
              <div className="grid gap-1.5">
                <Label>Event Type</Label>
                <Select
                  value={newEvent.color}
                  onValueChange={(value) =>
                    setNewEvent({ ...newEvent, color: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(eventTypes).map((type) => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              eventTypes[type as keyof typeof eventTypes]
                            }`}
                          />
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label>Groups</Label>
                <Popover
                  open={openPopover === "group"}
                  onOpenChange={(open) => setOpenPopover(open ? "group" : null)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="justify-between"
                    >
                      {newEvent.intakeGroups.length > 0
                        ? `${newEvent.intakeGroups.length} selected`
                        : "Select groups"}
                      <Search className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" side="bottom" align="start">
                    <Command>
                      <CommandInput placeholder="Search groups..." />
                      <CommandEmpty>No group found.</CommandEmpty>
                      <ScrollArea className="h-[125px]">
                        <CommandGroup>
                          {intakeGroups.map((group) => (
                            <CommandItem
                              key={group.id}
                              onSelect={() => handleIntakeGroupChange(group.id)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-3 w-3",
                                  newEvent.intakeGroups.includes(group.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {group.title}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </ScrollArea>
                    </Command>
                  </PopoverContent>
                </Popover>

                <div className="flex flex-wrap gap-1">
                  {newEvent.intakeGroups.map((groupId) => {
                    const group = intakeGroups.find((g) => g.id === groupId);
                    return group ? (
                      <Badge
                        key={groupId}
                        variant="secondary"
                        className="cursor-pointer text-xs"
                        onClick={() => handleIntakeGroupChange(groupId)}
                      >
                        {group.title} <X className="ml-1 h-3 w-3" />
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            {modalMode !== "create" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setModalMode("delete");
                  handleEventAction();
                }}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete"}
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleEventAction}
              disabled={isLoading || modalMode === "delete"}
            >
              {isLoading
                ? "Saving..."
                : modalMode === "create"
                ? "Create"
                : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
