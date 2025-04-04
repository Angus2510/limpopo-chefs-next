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
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>(
    []
  );
  const [currentCamera, setCurrentCamera] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    async function initializeScanner() {
      if (!isOpen) return;

      try {
        // Get available cameras
        const devices = await Html5Qrcode.getCameras();
        console.log("Available cameras:", devices);
        setCameras(devices);

        if (devices.length === 0) {
          toast({
            title: "No cameras found",
            description: "Please ensure you have a camera connected",
            variant: "destructive",
          });
          return;
        }

        // Try to find back camera
        const backCamera =
          devices.find(
            (device) =>
              device.label.toLowerCase().includes("back") ||
              device.label.toLowerCase().includes("rear")
          ) || devices[0];

        // Initialize scanner
        html5QrRef.current = new Html5Qrcode("reader");

        await html5QrRef.current.start(
          backCamera.id,
          {
            fps: 10,
            qrbox: 250,
            facingMode: "environment",
          },
          async (decodedText) => {
            console.log("QR Code detected:", decodedText);
            await onScan(decodedText);
            onClose();
          },
          (error) => {
            if (!error.includes("NotFoundException")) {
              console.warn(error);
            }
          }
        );

        setCurrentCamera(backCamera.id);
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

    // Cleanup
    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(console.error);
      }
    };
  }, [isOpen, onClose, onScan, toast]);

  const handleSwitchCamera = async () => {
    if (!html5QrRef.current || cameras.length <= 1) return;

    try {
      const currentIndex = cameras.findIndex(
        (camera) => camera.id === currentCamera
      );
      const nextCamera = cameras[(currentIndex + 1) % cameras.length];

      await html5QrRef.current.stop();
      await html5QrRef.current.start(
        nextCamera.id,
        {
          fps: 10,
          qrbox: 250,
          facingMode: "environment",
        },
        async (decodedText) => {
          console.log("QR Code detected:", decodedText);
          await onScan(decodedText);
          onClose();
        },
        (error) => {
          if (!error.includes("NotFoundException")) {
            console.warn(error);
          }
        }
      );

      setCurrentCamera(nextCamera.id);
    } catch (error) {
      console.error("Failed to switch camera:", error);
      toast({
        title: "Error",
        description: "Failed to switch camera",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex flex-col items-center">
          <div id="reader" className="w-full" />
          {cameras.length > 1 && (
            <Button
              variant="outline"
              size="icon"
              className="mt-4"
              onClick={handleSwitchCamera}
            >
              <SwitchCamera className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
