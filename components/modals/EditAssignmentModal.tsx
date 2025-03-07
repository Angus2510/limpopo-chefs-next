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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EditAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: {
    id: string;
    text: string;
    type: string;
    mark: string;
    correctAnswer?: any;
    options: {
      id: string;
      value?: string;
      columnA?: string;
      columnB?: string;
    }[];
  };
  answer?: {
    id: string;
    scores: number | null;
    moderatedscores: number | null;
  } | null;
  onSave: (data: any) => Promise<void>;
}

export function EditAssignmentModal({
  isOpen,
  onClose,
  question,
  answer,
  onSave,
}: EditAssignmentModalProps) {
  const [editedQuestion, setEditedQuestion] = useState(question);
  const [editedAnswer, setEditedAnswer] = useState(answer);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setIsLoading(true);
      console.log("🚀 Saving changes:", { editedQuestion, editedAnswer });

      await onSave({
        questionId: question.id,
        answerId: answer?.id,
        text: editedQuestion.text,
        mark: editedQuestion.mark,
        correctAnswer: editedQuestion.correctAnswer,
        options: editedQuestion.options,
        scores: editedAnswer?.scores,
        moderatedscores: editedAnswer?.moderatedscores,
      });

      toast({ description: "Changes saved successfully" });
      onClose();
    } catch (error) {
      console.error("❌ Save failed:", error);
      toast({
        variant: "destructive",
        description: "Failed to save changes",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Question & Answer</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="question">
          <TabsList>
            <TabsTrigger value="question">Question</TabsTrigger>
            {answer && <TabsTrigger value="answer">Scoring</TabsTrigger>}
          </TabsList>

          <TabsContent value="question" className="space-y-4">
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
                type="text"
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
          </TabsContent>

          {answer && (
            <TabsContent value="answer" className="space-y-4">
              <div>
                <Label>Score</Label>
                <Input
                  type="number"
                  value={editedAnswer?.scores ?? ""}
                  onChange={(e) =>
                    setEditedAnswer({
                      ...editedAnswer!,
                      scores: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>Moderated Score</Label>
                <Input
                  type="number"
                  value={editedAnswer?.moderatedscores ?? ""}
                  onChange={(e) =>
                    setEditedAnswer({
                      ...editedAnswer!,
                      moderatedscores: Number(e.target.value),
                    })
                  }
                />
              </div>
            </TabsContent>
          )}
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
