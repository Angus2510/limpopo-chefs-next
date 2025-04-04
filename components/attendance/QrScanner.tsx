"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Camera, RefreshCcw } from "lucide-react";

interface QrData {
  campusId: string;
  outcomeId: string;
  date: string;
  timestamp?: string;
}

interface QrScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => Promise<void>;
}

export function QrScanner({ isOpen, onClose, onScan }: QrScannerProps) {
  const html5QrRef = useRef<Html5Qrcode | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string>("");
  const [currentCamera, setCurrentCamera] = useState<string>("");
  const { toast } = useToast();

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission(true);
      setPermissionError("");
      return true;
    } catch (error) {
      console.error("Camera permission error:", error);
      setHasPermission(false);
      setPermissionError(
        "Camera access denied. Please grant camera permissions."
      );
      return false;
    }
  };

  const validateQrData = (data: string): QrData => {
    const parsed = JSON.parse(data);
    if (!parsed.campusId || !parsed.outcomeId || !parsed.date) {
      throw new Error("Invalid QR code - missing required fields");
    }
    return parsed as QrData;
  };

  const startScanner = async () => {
    if (!hasPermission) {
      const granted = await requestCameraPermission();
      if (!granted) return;
    }

    try {
      if (!html5QrRef.current) {
        html5QrRef.current = new Html5Qrcode("reader");
      }

      const devices = await Html5Qrcode.getCameras();
      console.log("Available cameras:", devices);

      if (devices && devices.length > 0) {
        // Try to find back camera
        const backCamera =
          devices.find(
            (device) =>
              device.label.toLowerCase().includes("back") ||
              device.label.toLowerCase().includes("rear") ||
              device.label.toLowerCase().includes("environment")
          ) || devices[0];

        console.log("Selected camera:", backCamera.label);
        setCurrentCamera(backCamera.id);

        await html5QrRef.current.start(
          backCamera.id,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            videoConstraints: {
              deviceId: backCamera.id,
              facingMode: "environment",
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          },
          async (decodedText) => {
            try {
              console.log("Raw QR data:", decodedText);
              const qrData = validateQrData(decodedText);
              console.log("Validated QR data:", qrData);

              await onScan(decodedText);

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
                title: "Invalid QR Code",
                description:
                  error instanceof Error
                    ? error.message
                    : "Failed to process QR code",
                variant: "destructive",
              });
            }
          },
          (error) => {
            // Only log non-NotFoundException errors
            if (!error.includes("NotFoundException")) {
              console.warn("QR Scan error:", error);
            }
          }
        );
      } else {
        throw new Error("No cameras found on your device");
      }
    } catch (error) {
      console.error("Scanner initialization failed:", error);
      setPermissionError(
        error instanceof Error ? error.message : "Failed to start camera"
      );
      toast({
        title: "Camera Error",
        description: "Failed to start camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      startScanner();
    }

    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(console.error);
      }
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Attendance QR Code</DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex flex-col items-center">
          {permissionError ? (
            <div className="text-center space-y-4">
              <p className="text-destructive">{permissionError}</p>
              <Button
                onClick={() => {
                  setPermissionError("");
                  startScanner();
                }}
                variant="outline"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Retry Camera Access
              </Button>
            </div>
          ) : (
            <div
              id="reader"
              className="w-full max-w-[300px]"
              style={{ minHeight: "300px" }}
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
