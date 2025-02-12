"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { SearchParamsProvider } from "../SearchParamsProvider";
import { DataTable } from "../DataTable";
import { uploadsSearchParamsSchema } from "./uploadsSearchParams";
import { Button } from "@/components/ui/button";
import { Filter } from "@/types/tables/select/filterTypes";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Loader2, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

// Helper function to extract the file name from a file path.
const getFileNameFromPath = (filePath: string): string => {
  return filePath.split("/").pop() || "downloaded-file";
};

/**
 * Helper to extract the file path from an upload object.
 * Adjust the fallback properties as necessary.
 */
const getUploadFilePath = (upload: any): string => {
  // Log the upload for debugging purposes.
  console.log("getUploadFilePath - upload object:", upload);
  return upload.filePath || upload.fileKey || "";
};

interface UploadsTableProps {
  uploads: any[];
  pageCount: number;
  initialSearch: any;
  intakeGroups: { id: string; title: string }[];
}

/**
 * Updated download handler:
 * - Extracts the fileName from the provided filePath.
 * - Sends both fileKey and fileName to the API route.
 * - Uses fileName for the download attribute of the link.
 */
const handleDownload = async (filePath: string): Promise<void> => {
  try {
    if (!filePath) {
      throw new Error("Missing file path for download");
    }
    // Extract the file name from the file path.
    const fileName = getFileNameFromPath(filePath);

    const response = await fetch("/api/materials/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileKey: filePath,
        fileName,
      }),
    });

    if (!response.ok) {
      throw new Error(`Download failed with status: ${response.status}`);
    }

    const { signedUrl } = await response.json();

    // Create a temporary link and trigger the download.
    const link = document.createElement("a");
    link.href = signedUrl;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Download error:", error);
    throw error;
  }
};

// View handler remains unchanged.
const handleView = async (upload: any) => {
  try {
    if (!upload?.id) {
      throw new Error("Missing document ID for viewing");
    }
    const url = `/api/admin/learning-materials/view?documentId=${upload.id}`;
    window.open(url, "_blank");
  } catch (error) {
    console.error("Error viewing file:", error);
    throw error;
  }
};

// Delete handler remains unchanged.
const handleDelete = async (id: string): Promise<void> => {
  const response = await fetch(`/api/materials/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Delete failed with status: ${response.status}`);
  }
};

/**
 * Bulk operations handler.
 * For downloads, it now uses the helper getUploadFilePath.
 */
const handleBulkOperations = async (
  selectedIds: string[],
  uploads: any[],
  operation: "download" | "delete"
) => {
  const errors: string[] = [];

  for (const id of selectedIds) {
    const upload = uploads.find((u) => u.id === id);
    try {
      if (operation === "download" && upload) {
        const filePath = getUploadFilePath(upload);
        if (!filePath) {
          throw new Error(
            `Missing file path or file key for download. Upload object: ${JSON.stringify(
              upload
            )}`
          );
        }
        await handleDownload(filePath);
      } else if (operation === "delete") {
        await handleDelete(id);
      }
    } catch (error) {
      errors.push(
        `Failed to ${operation} ${upload?.title || id}: ${
          (error as Error).message
        }`
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }
};

const columns = (
  router: ReturnType<typeof useRouter>,
  uploads: any[]
): ColumnDef<any, any>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Name",
    enableSorting: true,
  },
  {
    accessorKey: "description",
    header: "Description",
    enableSorting: true,
  },
  {
    accessorKey: "intakeGroups",
    header: "Intake Groups",
    enableSorting: false,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const upload = row.original;
      const [isDownloading, setIsDownloading] = React.useState(false);
      const [isDeleting, setIsDeleting] = React.useState(false);

      // Updated download function uses the helper getUploadFilePath.
      const downloadWithIndicator = async () => {
        setIsDownloading(true);
        try {
          console.log("Download requested for upload:", upload);
          const filePath = getUploadFilePath(upload);
          if (!filePath) {
            throw new Error("Missing file path or file key for download");
          }
          await handleDownload(filePath);
        } catch (error) {
          console.error("Error in downloadWithIndicator:", error);
          // Optionally, you could display an error toast/notification here.
        } finally {
          setIsDownloading(false);
        }
      };

      const deleteWithIndicator = async () => {
        setIsDeleting(true);
        try {
          await handleDelete(upload.id);
          router.refresh();
        } finally {
          setIsDeleting(false);
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(upload.id)}
            >
              Copy File ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleView(upload)}>
              <Eye className="mr-2 h-4 w-4" />
              View File
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(upload.id)}
            >
              Edit Document
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={downloadWithIndicator}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download File
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={deleteWithIndicator}
              disabled={isDeleting}
              className="text-red-500"
            >
              {isDeleting ? "Deleting..." : "Delete Document"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function UploadsTable({
  uploads,
  pageCount,
  initialSearch,
  intakeGroups,
}: UploadsTableProps) {
  const router = useRouter();

  const initialSearchParams = {
    page: initialSearch.page ?? 1,
    per_page: initialSearch.per_page ?? 10,
    sort: initialSearch.sort ?? "",
    search: initialSearch.search ?? "",
  };

  const initialFilters: Filter[] = [
    {
      title: "Intake Groups",
      options: intakeGroups.map((group) => ({
        id: group.id,
        title: group.title,
      })),
      selectedValues: initialSearch.intakeGroupTitles ?? [],
      key: "intakeGroupTitles",
    },
  ];

  const actionOptions = [
    { label: "Delete", value: "delete" },
    { label: "Download", value: "download" },
  ];

  const handleAction = async (action: string, selectedIds: string[]) => {
    try {
      if (action === "download" || action === "delete") {
        await handleBulkOperations(
          selectedIds,
          uploads,
          action as "download" | "delete"
        );
        if (action === "delete") {
          router.refresh();
        }
      }
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      throw error;
    }
  };

  return (
    <SearchParamsProvider
      searchSchema={uploadsSearchParamsSchema}
      initialState={initialSearchParams}
    >
      <DataTable
        columns={columns(router, uploads)}
        data={uploads}
        pageCount={pageCount}
        filters={initialFilters}
        onAction={handleAction}
        actionOptions={actionOptions}
      />
    </SearchParamsProvider>
  );
}
