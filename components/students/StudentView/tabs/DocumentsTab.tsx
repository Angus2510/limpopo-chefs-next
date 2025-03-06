"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Trash2, Eye, Download, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { deleteDocument } from "@/lib/actions/documents/deleteDocument";
import UploadDocumentDialog from "@/components/dialogs/uploads/UploadDocumentDialog";
import { formatDate } from "@/utils/formatDate";
import { useS3 } from "@/hooks/useS3";

interface Document {
  id: string;
  title: string;
  description?: string;
  category: string;
  uploadDate?: string;
  documentUrl: string;
  filePath: string;
}

interface DocumentsTabProps {
  documents: Document[];
  studentId: string;
}

export function DocumentsTab({ documents, studentId }: DocumentsTabProps) {
  const router = useRouter();
  const { viewFile, downloadFile, deleteFile, loading } = useS3();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (document: Document) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      setDeletingId(document.id);
      const fileKey = document.documentUrl || document.filePath;

      // First attempt to delete from S3
      const s3Success = await deleteFile(fileKey);
      if (!s3Success) {
        throw new Error("Failed to delete file from storage");
      }

      // Then delete from database
      const dbSuccess = await deleteDocument(document.id);
      if (!dbSuccess) {
        toast({
          title: "Warning",
          description: "File deleted from storage but database update failed",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete document",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const DocumentItem = ({
    document,
    category,
  }: {
    document: Document;
    category: string;
  }) => {
    const fileKey = document.documentUrl || document.filePath;
    const fileName = document.title;
    const isDeleting = deletingId === document.id;

    const handleDocumentDownload = async () => {
      try {
        await downloadFile({
          fileKey: String(fileKey),
          fileName: document.title,
        });
      } catch (error) {
        console.error("Download error:", error);
        toast({
          title: "Error",
          description: "Failed to download document",
          variant: "destructive",
        });
      }
    };
    return (
      <li className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <span className="text-xl">{category === "legal" ? "⚖️" : "📄"}</span>
          <div>
            <p className="font-medium">{fileName}</p>
            <p className="text-sm text-gray-500">{document.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            {formatDate(document.uploadDate)}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => viewFile(fileKey)}
              disabled={isDeleting}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDocumentDownload}
              disabled={loading === fileKey || isDeleting}
            >
              {loading === fileKey ? (
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
              className="text-red-600 hover:text-red-800 disabled:text-red-300"
              onClick={() => handleDelete(document)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </li>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Documents</CardTitle>
        <UploadDocumentDialog
          studentId={studentId}
          onUploadComplete={() => router.refresh()}
        />
      </CardHeader>
      <CardContent>
        {documents && documents.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="general">
              <AccordionTrigger>General Documents</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  {documents
                    .filter((doc) => doc.category === "general")
                    .map((doc) => (
                      <DocumentItem
                        key={doc.id}
                        document={doc}
                        category="general"
                      />
                    ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="legal">
              <AccordionTrigger>Legal Documents</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  {documents
                    .filter((doc) => doc.category === "legal")
                    .map((doc) => (
                      <DocumentItem
                        key={doc.id}
                        document={doc}
                        category="legal"
                      />
                    ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <p className="text-gray-500">No documents available</p>
        )}
      </CardContent>
    </Card>
  );
}
