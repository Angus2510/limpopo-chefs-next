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

// Helper function from StudentMaterialsCard
const getFileNameFromPath = (filePath: string): string => {
  return filePath.split("/").pop() || "downloaded-file";
};

interface UploadsTableProps {
  uploads: any[];
  pageCount: number;
  initialSearch: any;
  intakeGroups: { id: string; title: string }[];
}

// Define the view and download handlers
const handleView = async (upload: any) => {
  try {
    if (!upload?.id) {
      throw new Error(`Missing upload ID`);
    }

    const url = `/api/admin/learning-materials/view?documentId=${upload.id}`;
    window.open(url, "_blank");
  } catch (error) {
    console.error("Error viewing file:", error);
  }
};

const handleDownload = async (material: Material) => {
  try {
    console.log("Material object:", material);

    const fileKey = material.filePath;
    const fileName = getFileNameFromPath(material.filePath);

    if (!fileKey || !fileName) {
      throw new Error(
        `Missing fileKey or fileName. Received fileKey: ${fileKey}, fileName: ${fileName}`
      );
    }

    const response = await fetch("/api/materials/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileKey,
        fileName,
      }),
    });

    if (!response.ok) {
      throw new Error("Download failed");
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
    console.error("Error downloading file:", error);
  } finally {
    setDownloadingId(null);
  }
};

// Update bulk actions to include download functionality
const handleBulkDownload = async (selectedIds: string[], uploads: any[]) => {
  try {
    for (const id of selectedIds) {
      const upload = uploads.find((u) => u.id === id);
      if (upload) {
        await handleDownload(upload);
      }
    }
  } catch (error) {
    console.error("Error in bulk download:", error);
  }
};

// Define table columns
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

      const downloadWithIndicator = async () => {
        setIsDownloading(true);
        try {
          await handleDownload(upload);
        } finally {
          setIsDownloading(false);
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
              onClick={() => StudentMaterialsCard.delete(upload.id, router)}
              className="text-red-500"
            >
              Delete Document
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

  // Function to handle bulk actions
  const handleAction = async (action: string, selectedIds: string[]) => {
    console.log("Action:", action);
    console.log("Selected IDs:", selectedIds);

    if (action === "download") {
      await handleBulkDownload(selectedIds, uploads);
    }

    if (action === "delete") {
      await StudentMaterialsCard.bulkDelete(selectedIds, router);
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
