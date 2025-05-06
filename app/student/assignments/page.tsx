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

  const loadAssignments = async () => {
    try {
      console.log("📚 Fetching student assignments...");
      const data = await fetchStudentAssignments();
      if (!data) {
        throw new Error("No assignments data received");
      }

      // Process the assignments data to ensure retake properties are properly set
      const processedData = data.map((assignment) => ({
        ...assignment,
        retake: assignment.retake ?? false,
        maxAttempts: assignment.maxAttempts ?? 3,
        attempts: assignment.attempts ?? 0,
      }));

      console.log("✅ Assignments loaded:", processedData.length);
      setAssignments(processedData);
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

  const canTakeAssignment = (assignment: Assignment) => {
    const isAvailableToday = isSameDay(
      new Date(assignment.availableFrom),
      new Date()
    );

    const hasAttemptsLeft =
      (assignment.attempts || 0) < (assignment.maxAttempts || 3);

    // Can take if:
    // 1. Not completed OR
    // 2. Is retakeable AND has attempts left AND available today
    return (
      !assignment.completed ||
      (assignment.retake && hasAttemptsLeft && isAvailableToday)
    );
  };

  const handleStartAssignment = (assignment: Assignment) => {
    console.log("🎯 Attempting to start assignment:", {
      id: assignment.id,
      completed: assignment.completed,
      retake: assignment.retake,
      attempts: assignment.attempts,
      maxAttempts: assignment.maxAttempts,
    });

    if (!canTakeAssignment(assignment)) {
      const reason =
        assignment.attempts! >= assignment.maxAttempts!
          ? "Maximum attempts reached"
          : "Assignment cannot be retaken";

      toast({
        title: "Not Available",
        description: reason,
        variant: "destructive",
      });
      return;
    }

    setSelectedAssignment(assignment);
    setPasswordDialog(true);
    setPassword("");
  };

  const handlePasswordSubmit = async () => {
    if (!selectedAssignment || !password) {
      console.log("❌ Missing data:", {
        hasAssignment: !!selectedAssignment,
        hasPassword: !!password,
      });
      return;
    }

    try {
      console.log(
        "🔑 Validating password for assignment:",
        selectedAssignment.id
      );
      const validation = await validateAssignmentPassword(
        selectedAssignment.id,
        password.trim()
      );

      console.log("✅ Validation result:", validation);

      if (validation.valid) {
        // Set the cookie with the correct name that middleware expects
        document.cookie = `assignment_password=${password.trim()}; path=/`;

        // Close dialog
        setPasswordDialog(false);

        // Navigate to test
        const testPath = `/student/assignments/${selectedAssignment.id}`;
        console.log("🚀 Navigating to:", testPath);

        // Force navigation
        window.location.assign(testPath);
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

  const filteredAssignments = assignments.filter((assignment) =>
    canTakeAssignment(assignment)
  );

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
            {filteredAssignments.map((assignment) => (
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
                      Attempt {assignment.attempts} of {assignment.maxAttempts}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleStartAssignment(assignment)}
                    disabled={!canTakeAssignment(assignment)}
                    variant={assignment.completed ? "secondary" : "default"}
                    className="min-w-[80px] relative"
                  >
                    {assignment.completed ? "Retake" : "Start"}
                    {assignment.retake && (
                      <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-1 rounded-full">
                        {assignment.maxAttempts! - assignment.attempts!}
                      </span>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filteredAssignments.length === 0 && (
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
