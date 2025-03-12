"use client";

import QRGenerator from "@/components/attendance/QrGenerator";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ContentLayout } from "@/components/layout/content-layout";

export default function QRPage() {
  return (
    <ContentLayout>
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
            <QRGenerator />
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
