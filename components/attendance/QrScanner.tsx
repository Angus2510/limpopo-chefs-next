"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface QrScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => Promise<void>;
}

interface QrData {
  campusId: string;
  outcomeId: string;
  date: string;
  timestamp: string;
}

export function QrScanner({ isOpen, onClose, onScan }: QrScannerProps) {
  const html5QrRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function initializeScanner() {
      if (!isOpen) return;

      try {
        // Initialize scanner
        html5QrRef.current = new Html5Qrcode("reader");

        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          // Prefer back camera
          const backCamera =
            devices.find(
              (device) =>
                device.label.toLowerCase().includes("back") ||
                device.label.toLowerCase().includes("rear")
            ) || devices[0];

          await html5QrRef.current.start(
            backCamera.id,
            {
              fps: 10,
              qrbox: 250,
              aspectRatio: 1.0,
            },
            async (decodedText) => {
              try {
                // Parse QR data
                const qrData = JSON.parse(decodedText) as QrData;

                // Validate QR data
                if (!qrData.campusId || !qrData.outcomeId || !qrData.date) {
                  throw new Error("Invalid QR code format");
                }

                // Process scan
                await onScan(decodedText);

                // Stop scanner after successful scan
                if (html5QrRef.current) {
                  await html5QrRef.current.stop();
                }

                toast({
                  title: "Success",
                  description: "Attendance marked successfully",
                });

                onClose();
              } catch (error) {
                console.error("QR processing error:", error);
                toast({
                  title: "Error",
                  description:
                    error instanceof Error
                      ? error.message
                      : "Failed to process QR code",
                  variant: "destructive",
                });
              }
            },
            (error) => {
              if (!error.includes("NotFoundException")) {
                console.warn("QR Scan error:", error);
              }
            }
          );
        }
      } catch (error) {
        console.error("Scanner initialization failed:", error);
        toast({
          title: "Camera Error",
          description: "Failed to start camera. Please check permissions.",
          variant: "destructive",
        });
      }
    }

    initializeScanner();

    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(console.error);
      }
    };
  }, [isOpen, onClose, onScan, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Attendance QR Code</DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex flex-col items-center">
          <div
            id="reader"
            className="w-full max-w-[300px]"
            style={{ minHeight: "300px" }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
