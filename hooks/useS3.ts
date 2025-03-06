"use client";

import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { getViewUrl, getDownloadUrl, deleteFile } from "@/lib/s3-operations";

interface DownloadParams {
  fileKey: string;
  fileName?: string;
}

export function useS3() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleViewFile = async (fileKey: string) => {
    try {
      const signedUrl = await getViewUrl(fileKey);
      window.open(signedUrl, "_blank");
    } catch (error) {
      console.error("View file error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to view file",
        variant: "destructive",
      });
    }
  };

  const handleDownloadFile = async ({ fileKey, fileName }: DownloadParams) => {
    try {
      setLoading(fileKey);
      const signedUrl = await getDownloadUrl({
        fileKey: String(fileKey),
        fileName: String(fileName),
      });

      const link = document.createElement("a");
      link.href = signedUrl;
      // Use the provided fileName or extract from fileKey
      link.download =
        fileName || String(fileKey).split("/").pop() || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download file error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to download file",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteFile = async (fileKey: string) => {
    try {
      const success = await deleteFile(fileKey);
      if (success) {
        toast({
          title: "Success",
          description: "File deleted successfully",
        });
      }
      return success;
    } catch (error) {
      console.error("Delete file error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete file",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    viewFile: handleViewFile,
    downloadFile: handleDownloadFile,
    deleteFile: handleDeleteFile,
    loading,
  };
}
