"use client";

import { ChangeEvent, useRef } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { uploadWelImage } from "@/lib/actions/uploads/uploadWelImage";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  onRemove: (url: string) => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      try {
        // Convert file to Buffer
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}-${file.name}`;

        // Upload directly using your utility
        const filePath = await uploadFileToS3(
          buffer,
          "W.E.L",
          file.type,
          fileName
        );

        // Construct the full S3 URL
        const imageUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${filePath}`;

        onChange([...value, imageUrl]);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {value.map((url) => (
          <div key={url} className="relative aspect-square">
            <Image
              src={url}
              alt="WEL Image"
              fill
              className="object-cover rounded-md"
            />
            <Button
              type="button"
              onClick={() => onRemove(url)}
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={() => fileRef.current?.click()}
      >
        <ImagePlus className="h-4 w-4 mr-2" />
        Add Image
      </Button>
      <input
        type="file"
        ref={fileRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
