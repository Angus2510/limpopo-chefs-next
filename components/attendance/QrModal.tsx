"use client";

import { useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useEffect } from "react";

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "display" | "scan";
  onScan?: (data: string) => Promise<void>;
}

export function QrModal({
  isOpen,
  onClose,
  mode = "display",
  onScan,
}: QrModalProps) {
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isOpen && mode === "scan") {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(
        async (decodedText) => {
          if (onScan) {
            try {
              await onScan(decodedText);
              toast({
                title: "Success",
                description: "Attendance marked successfully",
              });
              scanner?.clear();
              onClose();
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to mark attendance",
                variant: "destructive",
              });
            }
          }
        },
        (error) => {
          console.error(error);
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [isOpen, mode, onScan, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "scan" ? "Scan QR Code" : "Display QR Code"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          {mode === "scan" && (
            <div id="qr-reader" className="w-full max-w-[300px]" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
