import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { EventForm } from "./EventForm";
import { Event, IntakeGroup, ModalMode } from "../../types";

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  selectedEvent: Event | null;
  intakeGroups: IntakeGroup[];
  mode: ModalMode;
  isLoading: boolean;
  onSubmit: (data: Partial<Event>) => Promise<void>;
  onDelete: () => void;
}

export function EventDialog({
  isOpen,
  onClose,
  selectedDate,
  selectedEvent,
  intakeGroups,
  mode,
  isLoading,
  onSubmit,
  onDelete,
}: EventDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? `Add Event - ${
                  selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""
                }`
              : `Edit Event - ${
                  selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""
                }`}
          </DialogTitle>
        </DialogHeader>
        <EventForm
          mode={mode}
          selectedEvent={selectedEvent}
          selectedDate={selectedDate} // Add this line
          intakeGroups={intakeGroups}
          isLoading={isLoading}
          onSubmit={onSubmit}
          onDelete={onDelete}
        />
      </DialogContent>
    </Dialog>
  );
}
