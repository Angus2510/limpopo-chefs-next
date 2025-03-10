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

interface CalendarDemoProps {
  intakeGroups: {
    id: string;
    title: string;
    outcome: string[];
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
    intakeGroups: [] as string[], // Changed to array for multi-select
    outcomes: [] as string[], // Changed to array for multi-select
  });

  // Log props on component mount for debugging
  React.useEffect(() => {
    console.log("Calendar Props:", {
      intakeGroups: intakeGroups?.length,
      outcomes: outcomes?.length,
      sampleGroup: intakeGroups?.[0],
    });
  }, [intakeGroups, outcomes]);

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await getEvents();
        console.log("Fetched events:", eventsData);
        if (Array.isArray(eventsData)) {
          setEvents(eventsData);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleIntakeGroupChange = (groupId: string) => {
    console.log("Selected group:", groupId);

    // Toggle the group selection
    setNewEvent((prev) => {
      const isSelected = prev.intakeGroups.includes(groupId);
      const updatedGroups = isSelected
        ? prev.intakeGroups.filter((id) => id !== groupId)
        : [...prev.intakeGroups, groupId];

      // Update available outcomes based on all selected groups
      let availableOutcomes: string[] = [];
      updatedGroups.forEach((gId) => {
        const group = intakeGroups.find((g) => g.id === gId);
        if (group?.outcome) {
          availableOutcomes = [...availableOutcomes, ...group.outcome];
        }
      });

      console.log("Available outcomes:", availableOutcomes);
      setSelectedGroupOutcomes(availableOutcomes);

      // Remove outcomes that are no longer available
      const validOutcomes = prev.outcomes.filter((o) =>
        availableOutcomes.includes(o)
      );

      return {
        ...prev,
        intakeGroups: updatedGroups,
        outcomes: validOutcomes,
      };
    });

    setOpenPopover(null);
  };

  const handleOutcomeChange = (outcomeId: string) => {
    setNewEvent((prev) => {
      const isSelected = prev.outcomes.includes(outcomeId);
      return {
        ...prev,
        outcomes: isSelected
          ? prev.outcomes.filter((id) => id !== outcomeId)
          : [...prev.outcomes, outcomeId],
      };
    });
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

    if (
      !selectedDate ||
      newEvent.intakeGroups.length === 0 ||
      !newEvent.title
    ) {
      console.error("Required fields missing:", {
        date: selectedDate,
        groups: newEvent.intakeGroups,
        title: newEvent.title,
      });
      return;
    }

    try {
      const eventData = {
        title: newEvent.title,
        details: newEvent.details,
        startDate: selectedDate,
        color: newEvent.color,
        location: [],
        assignedTo: [],
        assignedToModel: newEvent.intakeGroups,
        outcomes: newEvent.outcomes,
        createdBy: "system",
      };

      console.log("Submitting event data:", eventData);

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
        intakeGroups: [],
        outcomes: [],
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
      intakeGroups: event.assignedToModel || [],
      outcomes: [event.outcome].filter(Boolean),
    });
    setModalMode("edit");
    setIsModalOpen(true);

    // Update available outcomes based on selected groups
    let availableOutcomes: string[] = [];
    event.assignedToModel.forEach((groupId) => {
      const group = intakeGroups.find((g) => g.id === groupId);
      if (group?.outcome) {
        availableOutcomes = [...availableOutcomes, ...group.outcome];
      }
    });
    setSelectedGroupOutcomes(availableOutcomes);
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
              <Label>Intake Groups</Label>
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
                    {newEvent.intakeGroups.length > 0
                      ? `${newEvent.intakeGroups.length} groups selected`
                      : "Select intake groups"}
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

              {/* Display selected intake groups as badges */}
              <div className="flex flex-wrap gap-1 mt-1">
                {newEvent.intakeGroups.map((groupId) => {
                  const group = intakeGroups.find((g) => g.id === groupId);
                  return group ? (
                    <Badge
                      key={groupId}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleIntakeGroupChange(groupId)}
                    >
                      {group.title} <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Outcomes</Label>
              <Popover
                open={openPopover === "outcome"}
                onOpenChange={(open) => setOpenPopover(open ? "outcome" : null)}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                    disabled={newEvent.intakeGroups.length === 0}
                  >
                    {newEvent.outcomes.length > 0
                      ? `${newEvent.outcomes.length} outcomes selected`
                      : "Select outcomes"}
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
                              onSelect={() => handleOutcomeChange(outcome.id)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  newEvent.outcomes.includes(outcome.id)
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

              {/* Display selected outcomes as badges */}
              <div className="flex flex-wrap gap-1 mt-1">
                {newEvent.outcomes.map((outcomeId) => {
                  const outcome = outcomes.find((o) => o.id === outcomeId);
                  return outcome ? (
                    <Badge
                      key={outcomeId}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleOutcomeChange(outcomeId)}
                    >
                      {outcome.title} <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ) : null;
                })}
              </div>
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
