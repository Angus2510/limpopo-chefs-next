export interface Event {
  id: string;
  title: string;
  details: string;
  startDate: Date;
  startTime: string;
  campus: string; // Added campus field
  venue: string;
  lecturer: string;
  color: EventType;
  assignedToModel: string[];
  v: number; // Added v field
  deleted: boolean; // Added deleted field
  createdBy: string; // Added createdBy field
}

export type EventType =
  | "assessment"
  | "practical"
  | "video"
  | "notice"
  | "theory"
  | "other";

export interface IntakeGroup {
  id: string;
  title: string;
  outcome?: string[];
}

export interface CalendarProps {
  intakeGroups: IntakeGroup[];
}

export type ModalMode = "create" | "edit" | "delete";

export const EVENT_TYPES: Record<EventType, string> = {
  assessment: "bg-red-100 text-red-800 border-red-300",
  practical: "bg-yellow-100 text-yellow-800 border-yellow-300",
  video: "bg-blue-100 text-blue-800 border-blue-300",
  notice: "bg-green-100 text-green-800 border-green-300",
  theory: "bg-gray-100 text-gray-800 border-gray-300",
  other: "bg-gray-100 text-gray-800 border-gray-300",
};
