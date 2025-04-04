"use client";

import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  deleteAttendanceQR,
  type AttendanceQRCode,
} from "@/lib/actions/attendance/attendanceCrud";

interface AttendanceListProps {
  qrCodes: AttendanceQRCode[];
  onDelete: (id: string) => void;
}

export default function AttendanceList({
  qrCodes,
  onDelete,
}: AttendanceListProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const result = await deleteAttendanceQR(id);
      if (result.success) {
        onDelete(id);
        toast({
          title: "QR code deleted",
          description: "The QR code has been successfully deleted.",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete QR code",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated QR Codes</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full rounded-md border">
          <div className="space-y-4 p-4">
            {qrCodes.map((qr) => (
              <Card key={qr.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <QRCodeCanvas
                      value={JSON.stringify(qr.data)}
                      size={100}
                      level="H"
                      includeMargin
                      className="border p-1"
                    />
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{qr.data.campusTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        Date: {format(new Date(qr.data.date), "PPP")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Groups:{" "}
                        {qr.data.intakeGroups.map((g) => g.title).join(", ")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Outcome: {qr.data.outcome.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created: {format(new Date(qr.createdAt), "PPP p")}
                      </p>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isDeleting}
                      >
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the QR code.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(qr.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
