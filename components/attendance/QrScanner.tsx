"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SwitchCamera } from "lucide-react";

interface QrScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => Promise<void>;
}

export function QrScanner({ isOpen, onClose, onScan }: QrScannerProps) {
  const html5QrRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = "qr-scanner-container";
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>(
    []
  );
  const [currentCamera, setCurrentCamera] = useState<string>("");

  const switchCamera = async () => {
    if (!html5QrRef.current || cameras.length <= 1) return;

    const currentIndex = cameras.findIndex(
      (camera) => camera.id === currentCamera
    );
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];

    try {
      await html5QrRef.current.stop();
      await startScanner(nextCamera.id);
      setCurrentCamera(nextCamera.id);
    } catch (error) {
      console.error("Failed to switch camera:", error);
    }
  };

  const startScanner = async (cameraId: string) => {
    if (!html5QrRef.current) return;

    await html5QrRef.current.start(
      cameraId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      async (decodedText) => {
        console.log("QR Code detected:", decodedText);
        try {
          await onScan(decodedText);
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
        if (!errorMessage.includes("NotFoundException")) {
          console.warn("QR Scan error:", errorMessage);
        }
      }
    );
  };

  useEffect(() => {
    const initializeScanner = async () => {
      if (isOpen && !html5QrRef.current) {
        try {
          const element = document.getElementById(scannerDivId);
          if (!element) return;

          html5QrRef.current = new Html5Qrcode(scannerDivId);
          const devices = await Html5Qrcode.getCameras();
          setCameras(devices);

          if (devices.length > 0) {
            const defaultCamera = devices[0].id;
            setCurrentCamera(defaultCamera);
            await startScanner(defaultCamera);
          }
        } catch (err) {
          console.error("Failed to initialize scanner:", err);
        }
      }
    };

    const timeoutId = setTimeout(initializeScanner, 1000);

    return () => {
      clearTimeout(timeoutId);
      if (html5QrRef.current) {
        html5QrRef.current
          .stop()
          .then(() => {
            html5QrRef.current = null;
          })
          .catch(console.error);
      }
    };
  }, [isOpen, onScan, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          {cameras.length > 1 && (
            <Button
              variant="outline"
              size="icon"
              className="mt-4"
              onClick={switchCamera}
              title="Switch Camera"
            >
              <SwitchCamera className="h-4 w-4" />
            </Button>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            Point your camera at the QR code
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
