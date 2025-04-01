import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { WEL } from "@/types/wel";
import { useEffect } from "react";

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
  useEffect(() => {
    if (wel) {
      console.log("WELDetailDialog: Opened with data:", {
        title: wel.title,
        location: wel.location,
        imagesCount: wel.photoPath?.length || 0,
        images: wel.photoPath,
      });
    }
  }, [wel]);

  if (!wel) {
    console.log("WELDetailDialog: No WEL data provided");
    return null;
  }

  const handleImageError = (url: string) => {
    console.error("WELDetailDialog: Failed to load image:", url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{wel.title}</DialogTitle>
          <DialogDescription>{wel.location}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
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
              <h4 className="text-sm font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{wel.description}</p>
            </div>
          )}

          {wel.note && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground">{wel.note}</p>
            </div>
          )}

          {wel.photoPath && wel.photoPath.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Photos</h4>
              <div className="grid grid-cols-2 gap-4">
                {wel.photoPath.map((url, index) => {
                  console.log("WELDetailDialog: Rendering image:", url);
                  return (
                    <div
                      key={index}
                      className="relative aspect-video rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                    >
                      <Image
                        src={url}
                        alt={`${wel.title} - ${index + 1}`}
                        fill
                        className="object-cover"
                        onError={() => handleImageError(url)}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={index < 2} // Load first two images immediately
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
