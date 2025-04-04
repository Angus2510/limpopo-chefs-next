import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeCanvas } from "qrcode.react";

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrData: string;
  title: string;
}

export function QrModal({ isOpen, onClose, qrData, title }: QrModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center p-6">
          <QRCodeCanvas
            value={qrData}
            size={300}
            level="H"
            includeMargin
            className="border p-2"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
