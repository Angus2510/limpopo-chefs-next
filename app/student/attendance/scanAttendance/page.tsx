"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QrScanner } from "@/components/attendance/QrScanner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { markAttendance } from "@/lib/actions/attendance/getStudentAttendance";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentLayout } from "@/components/layout/content-layout";

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
      const parsedData = JSON.parse(decodedText);
      console.log("Parsed QR data:", parsedData);

      // Create attendance data in the correct format
      const attendanceData = {
        studentId: user.id,
        qrData: {
          campusId: parsedData.campusId,
          outcomeId: parsedData.outcome.id,
          date: parsedData.date,
        },
      };

      console.log("Sending attendance data:", attendanceData);

      const result = await markAttendance(attendanceData);

      if (!result.success) {
        throw new Error(result.error || "Failed to mark attendance");
      }

      toast({
        title: "Success",
        description: `Successfully marked present for ${parsedData.outcome.title}`,
      });

      setIsScanning(false);
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
    <ContentLayout title="Scan Attendance">
      <div className="container mx-auto py-6 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Mark Class Attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Point your camera at the QR code shown by your lecturer to mark
              your attendance
            </p>
            <Button
              onClick={() => setIsScanning(true)}
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Open Camera to Scan"}
            </Button>

            <QrScanner
              isOpen={isScanning}
              onClose={() => setIsScanning(false)}
              onScan={handleScan}
            />
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
