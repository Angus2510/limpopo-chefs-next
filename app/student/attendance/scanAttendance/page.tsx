"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QrModal } from "@/components/attendance/QrModal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { markAttendance } from "@/lib/actions/attendance/getStudentAttendance";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ScanAttendancePage() {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Ensure only students can access this page
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.userType !== "Student") {
      router.push("/dashboard");
      toast({
        title: "Access Denied",
        description: "Only students can mark attendance",
        variant: "destructive",
      });
    }
  }, [user, router, toast]);

  const handleScan = async (decodedText: string) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Parse the QR code data (contains class/session details)
      const qrData = JSON.parse(decodedText);

      // Validate QR code data
      if (!qrData.campusId || !qrData.outcomeId || !qrData.date) {
        throw new Error("Invalid QR code");
      }

      // Mark attendance
      const result = await markAttendance({
        studentId: user.id,
        qrData: {
          campusId: qrData.campusId,
          outcomeId: qrData.outcomeId,
          date: qrData.date,
        },
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to mark attendance");
      }

      toast({
        title: "Attendance Marked",
        description: `Successfully marked present for ${
          qrData.outcome?.title || "class"
        }`,
      });

      setIsScanning(false);
      // Optionally redirect to attendance view
      router.push("/student/attendance/viewAttendance");
    } catch (error: any) {
      console.error("Attendance marking failed:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to mark attendance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.userType !== "Student") {
    return null;
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Mark Class Attendance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Point your camera at the QR code shown by your lecturer to mark your
            attendance
          </p>
          <Button
            onClick={() => setIsScanning(true)}
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Open Camera to Scan"}
          </Button>

          <QrModal
            isOpen={isScanning}
            onClose={() => setIsScanning(false)}
            mode="scan"
            onScan={handleScan}
          />
        </CardContent>
      </Card>
    </div>
  );
}
