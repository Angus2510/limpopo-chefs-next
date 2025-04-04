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
import { useToast } from "@/components/ui/use-toast";

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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const startScanner = async (cameraId: string) => {
    if (!html5QrRef.current) return;

    try {
      await html5QrRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          facingMode: "environment",
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
      setCurrentCamera(cameraId);
    } catch (error) {
      console.error("Failed to start camera:", error);
      toast({
        title: "Camera Error",
        description: "Failed to start camera. Please try again.",
        variant: "destructive",
      });
    }
  };

  const switchCamera = async () => {
    if (!html5QrRef.current || cameras.length <= 1 || isLoading) return;

    setIsLoading(true);
    try {
      const currentIndex = cameras.findIndex(
        (camera) => camera.id === currentCamera
      );
      const nextIndex = (currentIndex + 1) % cameras.length;
      const nextCamera = cameras[nextIndex];

      console.log("Switching to camera:", nextCamera.label);

      await html5QrRef.current.stop();
      await new Promise((resolve) => setTimeout(resolve, 500)); // Add delay
      await startScanner(nextCamera.id);

      toast({
        title: "Camera Switched",
        description: `Now using ${nextCamera.label}`,
      });
    } catch (error) {
      console.error("Failed to switch camera:", error);
      toast({
        title: "Error",
        description: "Failed to switch camera. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeScanner = async () => {
      if (isOpen && !html5QrRef.current) {
        try {
          const element = document.getElementById(scannerDivId);
          if (!element) return;

          html5QrRef.current = new Html5Qrcode(scannerDivId);
          const devices = await Html5Qrcode.getCameras();
          console.log("Available cameras:", devices);
          setCameras(devices);

          if (devices.length > 0) {
            await startScanner(devices[0].id);
          } else {
            toast({
              title: "No Cameras",
              description: "No cameras found on your device.",
              variant: "destructive",
            });
          }
        } catch (err) {
          console.error("Scanner initialization failed:", err);
          toast({
            title: "Scanner Error",
            description: "Failed to initialize camera scanner.",
            variant: "destructive",
          });
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
  }, [isOpen, onScan, onClose, toast]);

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
              disabled={isLoading}
              title={`Switch Camera (Current: ${
                cameras.find((c) => c.id === currentCamera)?.label
              })`}
            >
              <SwitchCamera
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            {cameras.length > 1
              ? "Point your camera at the QR code. Click the button above to switch cameras."
              : "Point your camera at the QR code"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
