"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Question } from "@/types/assignment";

interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  onSave: (question: Question) => Promise<void>;
}

export function EditQuestionModal({
  isOpen,
  onClose,
  question,
  onSave,
}: EditQuestionModalProps) {
  const [editedQuestion, setEditedQuestion] = useState(question);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await onSave(editedQuestion);
      toast({ description: "Question updated successfully" });
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to update question",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Question Text</Label>
            <Textarea
              value={editedQuestion.text}
              onChange={(e) =>
                setEditedQuestion({
                  ...editedQuestion,
                  text: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label>Marks</Label>
            <Input
              type="number"
              value={editedQuestion.mark}
              onChange={(e) =>
                setEditedQuestion({
                  ...editedQuestion,
                  mark: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label>Correct Answer</Label>
            <Textarea
              value={
                typeof editedQuestion.correctAnswer === "string"
                  ? editedQuestion.correctAnswer
                  : JSON.stringify(editedQuestion.correctAnswer, null, 2)
              }
              onChange={(e) =>
                setEditedQuestion({
                  ...editedQuestion,
                  correctAnswer: e.target.value,
                })
              }
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
