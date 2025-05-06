"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format, isSameDay } from "date-fns";
import { fetchStudentAssignments } from "@/lib/actions/assignments/fetchStudentAssignments";
import { ContentLayout } from "@/components/layout/content-layout";
import { validateAssignmentPassword } from "@/lib/actions/assignments/validateAssignmentPassword";

interface Assignment {
  id: string;
  title: string;
  type: string;
  duration: number;
  availableFrom: Date;
  completed?: boolean;
  retake?: boolean;
  attempts?: number;
  maxAttempts?: number;
}

export default function StudentAssignmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [password, setPassword] = useState("");

  useEffect(() => {
    console.log("🚀 Component mounted, loading assignments...");
    loadAssignments();
  }, []);

  // In your page.tsx file, update the loadAssignments function:
  const loadAssignments = async () => {
    try {
      console.log("📚 Fetching student assignments...");
      const data = await fetchStudentAssignments();
      if (!data) {
        throw new Error("No assignments data received");
      }
      console.log("✅ Assignments loaded:", data.length);
      setAssignments(data);
    } catch (error) {
      console.error("❌ Failed to load assignments:", error);
      toast({
        title: "Error loading assignments",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssignment = (assignment: Assignment) => {
    if (assignment.completed && !assignment.retake) {
      toast({
        title: "Not Available",
        description: "This assessment cannot be retaken",
        variant: "destructive",
      });
      return;
    }

    if (
      assignment.maxAttempts &&
      assignment.attempts &&
      assignment.attempts >= assignment.maxAttempts
    ) {
      toast({
        title: "Maximum Attempts Reached",
        description:
          "You have reached the maximum number of attempts for this assessment",
        variant: "destructive",
      });
      return;
    }

    console.log("🎯 Starting assignment:", assignment.id);
    setSelectedAssignment(assignment);
    setPasswordDialog(true);
    setPassword("");
  };

  const handlePasswordSubmit = async () => {
    if (!selectedAssignment || !password) {
      console.log("❌ Missing assignment or password");
      return;
    }

    try {
      console.log("🔐 Validating password...");
      const validation = await validateAssignmentPassword(
        selectedAssignment.id,
        password.trim()
      );

      if (validation.valid) {
        console.log("✅ Password validated successfully");

        document.cookie = `assignment_${
          selectedAssignment.id
        }_password=${password.trim()}; path=/; max-age=7200; secure; samesite=lax`;

        setPasswordDialog(false);

        setTimeout(() => {
          router.push(`/student/assignments/${selectedAssignment.id}`);
        }, 100);
      } else {
        throw new Error(validation.message || "Invalid password");
      }
    } catch (error) {
      console.error("❌ Password validation failed:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Invalid password",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <ContentLayout title="Assignments">
        <div className="flex justify-center items-center h-48">
          Loading assignments...
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Assessments">
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Assessments</h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Available From</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments
              .filter((assignment) => {
                const isAvailableToday = isSameDay(
                  new Date(assignment.availableFrom),
                  new Date()
                );

                const hasAttemptsLeft =
                  !assignment.maxAttempts ||
                  (assignment.attempts || 0) < assignment.maxAttempts;

                return (
                  !assignment.completed ||
                  (isAvailableToday && hasAttemptsLeft) ||
                  (assignment.completed && assignment.retake && hasAttemptsLeft)
                );
              })
              .map((assignment) => (
                <TableRow
                  key={assignment.id}
                  className={`${
                    assignment.completed ? "bg-muted/50" : ""
                  } hover:bg-muted/60 transition-colors`}
                >
                  <TableCell className="font-medium">
                    {assignment.title}
                  </TableCell>
                  <TableCell>{assignment.type}</TableCell>
                  <TableCell>
                    {format(new Date(assignment.availableFrom), "PPP")}
                  </TableCell>
                  <TableCell>{assignment.duration} minutes</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">
                        {assignment.completed ? "Completed" : "Not Started"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Attempt {assignment.attempts || 0} of{" "}
                        {assignment.maxAttempts}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleStartAssignment(assignment)}
                      disabled={
                        !isSameDay(
                          new Date(assignment.availableFrom),
                          new Date()
                        ) ||
                        (assignment.attempts || 0) >=
                          (assignment.maxAttempts || 3)
                      }
                      variant={assignment.completed ? "secondary" : "default"}
                      className="min-w-[80px] relative"
                    >
                      {assignment.completed ? "Retake" : "Start"}
                      {assignment.retake && (
                        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-1 rounded-full">
                          {(assignment.maxAttempts || 3) -
                            (assignment.attempts || 0)}
                        </span>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

            {/* Empty state */}
            {assignments.filter(
              (a) =>
                !a.completed ||
                (a.retake && a.attempts && a.attempts < (a.maxAttempts || 3))
            ).length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span>No available assignments found</span>
                    <span className="text-sm">
                      Check back later for new assignments
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog
          open={passwordDialog}
          onOpenChange={(open) => {
            console.log("🔄 Password dialog state changing to:", open);
            setPasswordDialog(open);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Assessment Password</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    console.log("⌨️ Enter key pressed, submitting password");
                    handlePasswordSubmit();
                  }
                }}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log("❌ Password dialog cancelled");
                    setPasswordDialog(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    console.log("👆 Submit button clicked");
                    handlePasswordSubmit();
                  }}
                >
                  Submit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ContentLayout>
  );
}
