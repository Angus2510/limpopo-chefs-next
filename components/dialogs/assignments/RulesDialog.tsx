import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface RulesDialogProps {
  open: boolean;
  onClose: () => void;
  testInfo: {
    title: string;
    lecturer: string;
    type: string;
    date: Date;
    duration: number;
  };
}

export function RulesDialog({ open, onClose, testInfo }: RulesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-2">
            {testInfo.title}
          </DialogTitle>
          <DialogDescription>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <p>
                  <strong>Lecturer:</strong> {testInfo.lecturer}
                </p>
                <p>
                  <strong>Type:</strong> {testInfo.type}
                </p>
                <p>
                  <strong>Date:</strong> {format(testInfo.date, "PP")}
                </p>
                <p>
                  <strong>Duration:</strong> {testInfo.duration} minutes
                </p>
              </div>

              <div className="mt-3">
                <h3 className="font-semibold text-sm mb-1">
                  Rules and Instructions
                </h3>
                <ul className="list-disc pl-4 space-y-1 text-xs">
                  <li>Read all the questions carefully before answering.</li>
                  <li>
                    Ensure you answer all the questions before pressing the
                    submit button—once submitted, you cannot go back and make
                    changes.
                  </li>
                  <li>
                    Review your answers thoroughly before submission to avoid
                    mistakes.
                  </li>
                </ul>
              </div>

              <div className="mt-3">
                <h3 className="font-semibold text-sm text-red-600 mb-1">
                  STRICTLY PROHIBITED ACTIONS (RESULTING IN IMMEDIATE FAILURE):
                </h3>
                <ul className="list-disc pl-4 space-y-1 text-xs text-red-600">
                  <li>
                    Taking a screenshot, recording, or copying any part of the
                    test.
                  </li>
                  <li>Leaving or exiting the test before submission.</li>
                  <li>
                    Opening another tab, browser window, or application while
                    the test is in progress.
                  </li>
                  <li>Copying and pasting text into or from the test.</li>
                  <li>
                    Accessing personal notes, online resources, or external
                    materials.
                  </li>
                  <li>
                    Using assistance from another person or AI-based tools.
                  </li>
                </ul>
              </div>

              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800 text-xs">
                  <strong>Note:</strong> Achieving less than 40% on the test
                  will require a mandatory re-write, subject to a R450.00
                  re-write fee.
                </p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose} className="w-full text-sm">
            I understand and agree to the rules
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
