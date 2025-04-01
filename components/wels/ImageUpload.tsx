"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { uploadWelImage } from "@/lib/actions/uploads/uploadWelImage";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  onRemove: (url: string) => void;
  welId?: string;
}

interface PreviewImage {
  file: File;
  previewUrl: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  welId,
}: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      console.log(
        "Files selected:",
        newFiles.map((f) => ({
          name: f.name,
          type: f.type,
          size: f.size,
        }))
      );

      // Create preview URLs for selected files
      const newPreviews = newFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      setPreviewImages((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemovePreview = (previewUrl: string) => {
    setPreviewImages((prev) => prev.filter((p) => p.previewUrl !== previewUrl));
    URL.revokeObjectURL(previewUrl);
  };

  const handleFormSubmit = async () => {
    try {
      setIsUploading(true);
      console.log("Starting upload for", previewImages.length, "images");

      // Upload each image using the server action
      const uploadPromises = previewImages.map(async ({ file }) => {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("welId", welId || "new");

        console.log("Uploading image:", file.name);
        const result = await uploadWelImage(formData);
        console.log("Upload result for", file.name, ":", result);

        if (!result.success) throw new Error(result.error || "Upload failed");
        return result.imageUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      console.log("All uploads complete. URLs:", uploadedUrls);

      onChange([...value, ...uploadedUrls]);

      // Clean up preview URLs
      previewImages.forEach(({ previewUrl }) =>
        URL.revokeObjectURL(previewUrl)
      );
      setPreviewImages([]);
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing uploaded images */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {value.map((url) => (
            <div key={url} className="relative aspect-square">
              <Image
                src={url}
                alt="Uploaded WEL Image"
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
      )}

      {/* Preview images */}
      {previewImages.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {previewImages.map(({ previewUrl }) => (
              <div key={previewUrl} className="relative aspect-square">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover rounded-md"
                />
                <Button
                  type="button"
                  onClick={() => handleRemovePreview(previewUrl)}
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
            onClick={handleFormSubmit}
            className="w-full"
            variant="default"
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload Selected Images"}
          </Button>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={() => fileRef.current?.click()}
      >
        <ImagePlus className="h-4 w-4 mr-2" />
        Select Images
      </Button>
      <input
        type="file"
        ref={fileRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />
    </div>
  );
}
