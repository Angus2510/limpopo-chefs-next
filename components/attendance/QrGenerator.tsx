"use client";
import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";

interface QRGeneratorProps {
  initialData?: string;
}

interface LessonQRData {
  intakeGroupId: string;
  intakeGroupTitle: string;
  timestamp: string;
  expiresIn: number;
}

interface IntakeGroup {
  id: string;
  title: string;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({ initialData }) => {
  const [intakeGroups, setIntakeGroups] = useState<IntakeGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [expiryTime, setExpiryTime] = useState<number>(15);
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntakeGroups = async () => {
      try {
        const groups = await getAllIntakeGroups();
        setIntakeGroups(groups);
      } catch (error) {
        console.error("Failed to fetch intake groups:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIntakeGroups();
  }, []);

  const generateQRCode = () => {
    const now = new Date();
    const selectedIntakeGroup = intakeGroups.find(
      (group) => group.id === selectedGroup
    );

    if (!selectedIntakeGroup) return;

    const data: LessonQRData = {
      intakeGroupId: selectedIntakeGroup.id,
      intakeGroupTitle: selectedIntakeGroup.title,
      timestamp: now.toISOString(),
      expiresIn: expiryTime,
    };
    setGeneratedQR(JSON.stringify(data));
  };

  if (loading) {
    return <div>Loading intake groups...</div>;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Generate Attendance QR Code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="intakeGroup">Intake Group</Label>
          <Select onValueChange={setSelectedGroup} value={selectedGroup}>
            <SelectTrigger>
              <SelectValue placeholder="Select an intake group" />
            </SelectTrigger>
            <SelectContent>
              {intakeGroups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiry">QR Code Expiry Time</Label>
          <Select
            onValueChange={(value) => setExpiryTime(Number(value))}
            defaultValue="15"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select expiry time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 minutes</SelectItem>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={generateQRCode}
          disabled={!selectedGroup}
          className="w-full"
          variant={!selectedGroup ? "secondary" : "default"}
        >
          Generate QR Code
        </Button>

        {generatedQR && (
          <div className="mt-6 flex flex-col items-center space-y-4">
            <QRCodeCanvas
              value={generatedQR}
              size={200}
              level="H"
              includeMargin
              className="border p-2"
            />
            <p className="text-sm text-muted-foreground">
              QR Code for{" "}
              {intakeGroups.find((g) => g.id === selectedGroup)?.title}
            </p>
            <p className="text-sm text-muted-foreground">
              Expires in {expiryTime} minutes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRGenerator;
