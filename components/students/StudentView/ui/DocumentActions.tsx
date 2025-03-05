"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Eye, Download, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteDocument } from "@/lib/actions/documents/deleteDocument";

interface DocumentActionsProps {
  document: {
    id: string;
    title: string;
    filePath: string; // Changed from documentUrl to filePath to match working example
  };
}

// Helper function from StudentLearningMaterialsCard
const getFileNameFromPath = (filePath: string): string => {
  return filePath.split("/").pop() || "downloaded-file";
};

export function DocumentActions({ document }: DocumentActionsProps) {
  const router = useRouter();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const isDownloading = downloadingId === document.id;

  const handleDownload = async () => {
    try {
      setDownloadingId(document.id);
      const fileKey = document.filePath;
      const fileName = getFileNameFromPath(document.filePath);

      if (!fileKey || !fileName) {
        throw new Error("Missing file information");
      }

      const response = await fetch("/api/documents/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileKey,
        }),
      });

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const { signedUrl } = await response.json();

      // Create a temporary link and trigger the download
      const link = document.createElement("a");
      link.href = signedUrl;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleView = async () => {
    try {
      const fileKey = document.filePath;

      if (!fileKey) {
        throw new Error("Missing file information");
      }

      const response = await fetch("/api/documents/view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileKey,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get view URL");
      }

      const { signedUrl } = await response.json();
      window.open(signedUrl, "_blank");
    } catch (error) {
      console.error("Error viewing file:", error);
      toast({
        title: "Error",
        description: "Failed to view document",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDocument(document.id);
        toast({
          title: "Success",
          description: "Document deleted successfully",
        });
        router.refresh();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete document",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={handleView}>
        <Eye className="h-4 w-4 mr-1" />
        View
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleDownload}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <>
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            Downloading...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-1" />
            Download
          </>
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="text-red-600 hover:text-red-800"
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
