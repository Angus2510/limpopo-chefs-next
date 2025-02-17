"use client";

import { useState, useEffect } from "react";
import { Campus } from "@/lib/actions/campus/campuses";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface CampusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campus: Campus | null;
  onSave: (data: { title: string }) => Promise<void>;
}

export default function CampusDialog({
  open,
  onOpenChange,
  campus,
  onSave,
}: CampusDialogProps) {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset form when dialog opens/closes or campus changes
  useEffect(() => {
    if (open && campus) {
      setTitle(campus.title);
    } else if (!open) {
      setTitle("");
    }
  }, [open, campus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Campus name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({ title: title.trim() });
      onOpenChange(false);
      toast({
        title: "Success",
        description: `Campus ${campus ? "updated" : "created"} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${campus ? "update" : "create"} campus`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{campus ? "Edit Campus" : "Add New Campus"}</DialogTitle>
          <DialogDescription>
            {campus
              ? "Update the campus details below."
              : "Enter the details for the new campus."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Name
              </Label>
              <div className="col-span-3">
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter campus name"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : campus
                ? "Update Campus"
                : "Create Campus"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
