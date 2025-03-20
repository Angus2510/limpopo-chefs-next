import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import {
  Event,
  IntakeGroup,
  ModalMode,
  EVENT_TYPES,
} from "@/types/events/Events";
import { GroupSelector } from "./GroupSelector";

const VENUES = {
  mokopane: [
    "Classroom 1",
    "Classroom 2",
    "Internet Cafe",
    "Kitchen 1",
    "Kitchen 2",
    "Catering Kitchen",
  ],
  polokwane: [
    "Veggie class",
    "Demo class",
    "Black n white class",
    "Black n white kitchen",
    "Junior kitchen",
    "Junior kitchen front",
    "Junior kitchen back",
    "Rec room",
  ],
} as const;

const LECTURERS = [
  "Chef Kelly",
  "Chef Breyton",
  "Chef Kopano",
  "Chef Raiyen",
  "Chef Nadine",
  "Chef Thuto",
  "Shoki",
  "Chef Attie",
  "Chef Jim",
  "Chef Valentine",
  "Chef Skhumbuzo",
  "Chef Thakgalo",
  "Bonnie",
  "Thandi",
] as const;

interface EventFormProps {
  mode: ModalMode;
  selectedEvent: Event | null;
  intakeGroups: IntakeGroup[];
  isLoading: boolean;
  onSubmit: (data: Partial<Event>) => Promise<void>;
  onDelete: () => void;
}

export function EventForm({
  mode,
  selectedEvent,
  intakeGroups,
  isLoading,
  onSubmit,
  onDelete,
}: EventFormProps) {
  const [formData, setFormData] = useState({
    title: selectedEvent?.title || "",
    details: selectedEvent?.details || "",
    startTime: selectedEvent?.startTime || "09:00",
    campus: selectedEvent?.campus || "",
    venue: selectedEvent?.venue || "",
    lecturer: selectedEvent?.lecturer || "",
    color: selectedEvent?.color || "other",
    assignedToModel: selectedEvent?.assignedToModel || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="details">Details</Label>
        <Textarea
          id="details"
          value={formData.details}
          onChange={(e) =>
            setFormData({ ...formData, details: e.target.value })
          }
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="startTime">Start Time</Label>
        <Input
          id="startTime"
          type="time"
          value={formData.startTime}
          onChange={(e) =>
            setFormData({ ...formData, startTime: e.target.value })
          }
        />
      </div>

      <div className="grid gap-2">
        <Label>Campus</Label>
        <Select
          value={formData.campus}
          onValueChange={(value) =>
            setFormData({
              ...formData,
              campus: value,
              venue: "", // Reset venue when campus changes
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select campus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mokopane">Mokopane</SelectItem>
            <SelectItem value="polokwane">Polokwane</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>Venue</Label>
        <Select
          value={formData.venue}
          onValueChange={(value) => setFormData({ ...formData, venue: value })}
          disabled={!formData.campus}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                formData.campus ? "Select venue" : "Select campus first"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {formData.campus &&
              VENUES[formData.campus as keyof typeof VENUES].map((venue) => (
                <SelectItem key={venue} value={venue}>
                  {venue}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>Lecturer</Label>
        <Select
          value={formData.lecturer}
          onValueChange={(value) =>
            setFormData({ ...formData, lecturer: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select lecturer" />
          </SelectTrigger>
          <SelectContent>
            {LECTURERS.map((lecturer) => (
              <SelectItem key={lecturer} value={lecturer}>
                {lecturer}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>Event Type</Label>
        <Select
          value={formData.color}
          onValueChange={(value) => setFormData({ ...formData, color: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(EVENT_TYPES).map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <GroupSelector
        intakeGroups={intakeGroups}
        selectedGroups={formData.assignedToModel}
        onChange={(groups) =>
          setFormData({ ...formData, assignedToModel: groups })
        }
      />

      <div className="flex justify-between pt-4">
        {mode !== "create" && (
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={isLoading}
          >
            Delete
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : mode === "create" ? "Create" : "Update"}
        </Button>
      </div>
    </form>
  );
}
