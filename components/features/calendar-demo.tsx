"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Search,
  Trash2,
  Edit,
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
import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";
import { getAllOutcomes } from "@/lib/actions/outcome/outcomeQuery";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "@/lib/actions/events/getEvents";

interface CalendarDemoProps {
  intakeGroups: IntakeGroup[];
  outcomes: Outcome[];
}

interface Event {
  id: string;
  title: string;
  details: string;
  startDate: string;
  endDate?: string;
  color: string;
  location: string[];
  assignedTo: string[];
  assignedToModel: string[];
  outcome: string;
  createdBy: string;
  v: number;
}

interface IntakeGroup {
  id: string;
  title: string;
  outcome: string[];
}

interface Outcome {
  id: string;
  title: string;
  type: string;
  hidden: boolean;
}

const eventTypes = {
  practical: "bg-red-100 text-red-800 border-red-300",
  theory: "bg-blue-100 text-blue-800 border-blue-300",
  assessment: "bg-green-100 text-green-800 border-green-300",
  other: "bg-gray-100 text-gray-800 border-gray-300",
};

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
  const dayEvents = events.filter((event) =>
    isSameDay(parseISO(event.startDate), date)
  );

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

export default function CalendarDemo({
  intakeGroups,
  outcomes,
}: CalendarDemoProps) {
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const [events, setEvents] = React.useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<
    "create" | "edit" | "delete"
  >("create");
  const [selectedGroupOutcomes, setSelectedGroupOutcomes] = React.useState<
    string[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [openPopover, setOpenPopover] = React.useState<
    "group" | "outcome" | null
  >(null);
  const [newEvent, setNewEvent] = React.useState({
    title: "",
    details: "",
    color: "other",
    intakeGroup: "",
    outcome: "",
  });

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/events");
        if (!response.ok) throw new Error("Failed to fetch events");
        const eventsData = await response.json();

        console.log("Fetched events:", eventsData); // For debugging
        setEvents(eventsData);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleIntakeGroupChange = (groupId: string) => {
    const selectedGroup = intakeGroups.find((g) => g.id === groupId);

    setNewEvent((prev) => ({
      ...prev,
      intakeGroup: groupId,
      outcome: "", // Reset outcome when group changes
    }));

    if (selectedGroup?.outcome) {
      setSelectedGroupOutcomes(selectedGroup.outcome);
    } else {
      setSelectedGroupOutcomes([]);
    }

    setOpenPopover(null);
  };

  const handleEventAction = async () => {
    if (modalMode === "delete" && selectedEvent) {
      try {
        await deleteEvent(selectedEvent.id);
        setEvents(events.filter((e) => e.id !== selectedEvent.id));
        setIsModalOpen(false);
        setSelectedEvent(null);
      } catch (error) {
        console.error("Failed to delete event:", error);
      }
      return;
    }

    if (!selectedDate || !newEvent.intakeGroup || !newEvent.title) return;

    try {
      const eventData = {
        title: newEvent.title,
        details: newEvent.details,
        startDate: selectedDate,
        color: newEvent.color,
        location: [],
        assignedTo: [],
        assignedToModel: [newEvent.intakeGroup],
        outcome: newEvent.outcome,
        createdBy: "system", // Replace with actual user ID later
      };

      if (modalMode === "edit" && selectedEvent) {
        const updatedEvent = await updateEvent(selectedEvent.id, eventData);
        setEvents(
          events.map((e) => (e.id === selectedEvent.id ? updatedEvent : e))
        );
      } else {
        const createdEvent = await createEvent(eventData);
        setEvents((prev) => [...prev, createdEvent]);
      }

      setNewEvent({
        title: "",
        details: "",
        color: "other",
        intakeGroup: "",
        outcome: "",
      });
      setIsModalOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error("Failed to handle event:", error);
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setNewEvent({
      title: event.title,
      details: event.details,
      color: event.color,
      intakeGroup: event.assignedToModel[0],
      outcome: event.outcome,
    });
    setModalMode("edit");
    setIsModalOpen(true);
  };

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
              setIsModalOpen(true);
            }}
            onEventClick={handleEventClick}
          />
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" ? "Add Event for " : "Edit Event on "}
              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="details">Details</Label>
              <Textarea
                id="details"
                value={newEvent.details}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, details: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>Intake Group</Label>
              <Popover
                open={openPopover === "group"}
                onOpenChange={(open) => setOpenPopover(open ? "group" : null)}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {newEvent.intakeGroup
                      ? intakeGroups.find(
                          (group) => group.id === newEvent.intakeGroup
                        )?.title
                      : "Select intake group"}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search intake groups..." />
                    <CommandEmpty>No intake group found.</CommandEmpty>
                    <ScrollArea className="h-[200px]">
                      <CommandGroup>
                        {intakeGroups.map((group) => (
                          <CommandItem
                            key={group.id}
                            onSelect={() => handleIntakeGroupChange(group.id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                newEvent.intakeGroup === group.id
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
            </div>

            <div className="grid gap-2">
              <Label>Outcome</Label>
              <Popover
                open={openPopover === "outcome"}
                onOpenChange={(open) => setOpenPopover(open ? "outcome" : null)}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                    disabled={!newEvent.intakeGroup}
                  >
                    {newEvent.outcome
                      ? outcomes.find((o) => o.id === newEvent.outcome)?.title
                      : "Select outcome"}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search outcomes..." />
                    <CommandEmpty>No outcome found.</CommandEmpty>
                    <ScrollArea className="h-[200px]">
                      <CommandGroup>
                        {outcomes
                          .filter(
                            (outcome) =>
                              selectedGroupOutcomes.includes(outcome.id) &&
                              !outcome.hidden
                          )
                          .map((outcome) => (
                            <CommandItem
                              key={outcome.id}
                              onSelect={() => {
                                setNewEvent((prev) => ({
                                  ...prev,
                                  outcome: outcome.id,
                                }));
                                setOpenPopover(null);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  newEvent.outcome === outcome.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {outcome.title}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </ScrollArea>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label>Event Type</Label>
              <Select
                value={newEvent.color}
                onValueChange={(value) =>
                  setNewEvent({ ...newEvent, color: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(eventTypes).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            {modalMode !== "create" && (
              <Button
                variant="destructive"
                onClick={() => {
                  setModalMode("delete");
                  handleEventAction();
                }}
              >
                Delete Event
              </Button>
            )}
            <Button onClick={handleEventAction}>
              {modalMode === "create" ? "Create Event" : "Update Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
