"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QrScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => Promise<void>;
}

export function QrScanner({ isOpen, onClose, onScan }: QrScannerProps) {
  const html5QrRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = "qr-scanner-container";

  useEffect(() => {
    const initializeScanner = async () => {
      if (isOpen && !html5QrRef.current) {
        console.log("Initializing camera scanner...");
        try {
          // Wait for DOM element to be available
          const element = document.getElementById(scannerDivId);
          if (!element) {
            console.error("Scanner element not found");
            return;
          }

          html5QrRef.current = new Html5Qrcode(scannerDivId);

          const devices = await Html5Qrcode.getCameras();
          console.log("Available cameras:", devices);

          if (devices && devices.length > 0) {
            const cameraId = devices[0].id;
            await html5QrRef.current.start(
              cameraId,
              {
                fps: 10,
                qrbox: { width: 250, height: 250 },
              },
              async (decodedText) => {
                console.log("QR Code detected:", decodedText);
                try {
                  await onScan(decodedText);
                  console.log("Successfully processed scan");
                  if (html5QrRef.current) {
                    await html5QrRef.current.stop();
                    html5QrRef.current = null;
                  }
                  onClose();
                } catch (error) {
                  console.error("Failed to process scan:", error);
                }
              },
              (errorMessage) => {
                console.warn("QR Scan error:", errorMessage);
              }
            );
            console.log("Camera started successfully");
          } else {
            console.error("No cameras found");
          }
        } catch (err) {
          console.error("Failed to initialize scanner:", err);
        }
      }
    };

    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      initializeScanner();
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      if (html5QrRef.current) {
        console.log("Stopping camera scanner...");
        html5QrRef.current
          .stop()
          .then(() => {
            html5QrRef.current = null;
            console.log("Camera scanner stopped");
          })
          .catch((err) => console.error("Failed to stop scanner:", err));
      }
    };
  }, [isOpen, onScan, onClose, scannerDivId]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        console.log("Dialog state changing to:", open);
        onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex flex-col items-center">
          <div
            id={scannerDivId}
            className="w-full max-w-[300px]"
            style={{
              minHeight: "300px",
              backgroundColor: "#000000",
            }}
          />
          <p className="text-sm text-muted-foreground mt-2">
            Point your camera at the QR code
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
