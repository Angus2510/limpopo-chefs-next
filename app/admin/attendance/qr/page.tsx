"use client";

import QRGenerator from "@/components/attendance/QrGenerator";
import AttendanceList from "@/components/attendance/attendanceList";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ContentLayout } from "@/components/layout/content-layout";
import { getAttendanceQRs } from "@/lib/actions/attendance/attendanceCrud";
import { useEffect, useState } from "react";
import type { AttendanceQRCode } from "@/lib/actions/attendance/attendanceCrud";

export default function QRPage() {
  const [qrCodes, setQrCodes] = useState<AttendanceQRCode[]>([]);

  useEffect(() => {
    const fetchQRCodes = async () => {
      const { data } = await getAttendanceQRs();
      if (data) {
        setQrCodes(data);
      }
    };
    fetchQRCodes();
  }, []);

  const handleDelete = (id: string) => {
    setQrCodes((prev) => prev.filter((qr) => qr.id !== id));
  };

  return (
    <ContentLayout title="Class Attendance QR Code">
      <div className="container mx-auto space-y-6">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">
            Class Attendance QR Code
          </h2>
          <p className="text-muted-foreground">
            Generate a QR code for students to scan and mark attendance
          </p>
        </div>
        <Separator />
        <Card>
          <CardContent className="p-6">
            <QRGenerator
              onGenerate={(newQR) => setQrCodes((prev) => [newQR, ...prev])}
            />
          </CardContent>
        </Card>
        <AttendanceList qrCodes={qrCodes} onDelete={handleDelete} />
      </div>
    </ContentLayout>
  );
}
