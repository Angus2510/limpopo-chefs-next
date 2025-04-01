import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WEL } from "@/types/wel";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface WELDetailDialogProps {
  wel: WEL | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WELDetailDialog({
  wel,
  isOpen,
  onClose,
}: WELDetailDialogProps) {
  if (!wel) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{wel.title}</DialogTitle>
          <DialogDescription>{wel.location}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant={wel.available ? "default" : "secondary"}>
              {wel.available ? "Available" : "Not Available"}
            </Badge>
            {wel.accommodation && (
              <Badge variant="outline">Accommodation Available</Badge>
            )}
          </div>

          {wel.description && (
            <div>
              <h4 className="text-sm font-semibold mb-1">Description</h4>
              <p className="text-sm text-muted-foreground">{wel.description}</p>
            </div>
          )}

          {wel.note && (
            <div>
              <h4 className="text-sm font-semibold mb-1">Notes</h4>
              <p className="text-sm text-muted-foreground">{wel.note}</p>
            </div>
          )}

          {wel.photoPath && wel.photoPath.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Photos</h4>
              <div className="grid grid-cols-2 gap-4">
                {wel.photoPath.map((url, index) => (
                  <div key={index} className="relative aspect-video">
                    <Image
                      src={url}
                      alt={`${wel.title} - ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
