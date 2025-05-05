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
      console.log("✅ Assignments loaded:", data.length);
      setAssignments(data);
    } catch (error) {
      console.error("❌ Failed to load assignments:", error);
      toast({
        title: "Error",
        description: "Could not load assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssignment = (assignment: Assignment) => {
    if (assignment.completed) {
      toast({
        title: "Already Completed",
        description: "You have already completed this assessment",
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

        // Set cookie with longer expiration and proper path
        document.cookie = `assignment_${
          selectedAssignment.id
        }_password=${password.trim()}; path=/; max-age=7200; secure; samesite=lax`;

        // Close dialog first
        setPasswordDialog(false);

        // Add small delay to ensure cookie is set
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
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>{assignment.title}</TableCell>
                <TableCell>{assignment.type}</TableCell>
                <TableCell>
                  {format(new Date(assignment.availableFrom), "PPP")}
                </TableCell>
                <TableCell>
                  {Math.floor(assignment.duration / 60)}h{" "}
                  {assignment.duration % 60}m
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleStartAssignment(assignment)}
                    disabled={
                      assignment.completed ||
                      (!isSameDay(
                        new Date(assignment.availableFrom),
                        new Date()
                      ) &&
                        new Date() < new Date(assignment.availableFrom))
                    }
                    variant={assignment.completed ? "secondary" : "default"}
                    className={`${
                      assignment.completed
                        ? "opacity-50 cursor-not-allowed pointer-events-none"
                        : ""
                    }`}
                  >
                    {assignment.completed ? "Completed" : "Start"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
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
