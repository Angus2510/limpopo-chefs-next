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
import {
  Download,
  Loader2,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { useS3 } from "@/hooks/useS3";

interface Material {
  id: string;
  title: string;
  description?: string;
  fileType?: string;
  uploadDate?: string;
  moduleNumber?: number;
  filePath: string;
  documentPath?: string;
  intakeGroups?: string[];
}

interface UploadsTableProps {
  uploads: Material[];
  pageCount: number;
  initialSearch: {
    page?: number;
    per_page?: number;
    sort?: string;
    search?: string;
    intakeGroupTitles?: string[];
  };
  intakeGroups: { id: string; title: string }[];
}

const getFileNameFromPath = (filePath: string): string => {
  return filePath.split("/").pop() || "downloaded-file";
};

export function UploadsTable({
  uploads,
  pageCount,
  initialSearch,
  intakeGroups,
}: UploadsTableProps) {
  const router = useRouter();
  const { downloadFile, loading } = useS3();

  const handleView = async (upload: Material) => {
    try {
      if (!upload?.id) {
        throw new Error("Missing document ID for viewing");
      }
      const url = `/api/admin/learning-materials/view?documentId=${upload.id}`;
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error viewing file:", error);
      toast({
        title: "View Failed",
        description:
          error instanceof Error ? error.message : "Failed to view file",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    const response = await fetch(`/api/materials/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Delete failed with status: ${response.status}`);
    }
  };

  const handleBulkOperations = React.useCallback(
    async (selectedIds: string[], operation: "download" | "delete") => {
      const errors: string[] = [];

      for (const id of selectedIds) {
        const upload = uploads.find((u) => u.id === id);
        try {
          if (operation === "download" && upload) {
            const fileKey = upload.filePath || upload.documentPath;
            if (fileKey) {
              await downloadFile({
                fileKey,
                fileName: upload.title || getFileNameFromPath(fileKey),
              });
            }
          } else if (operation === "delete") {
            await handleDelete(id);
          }
        } catch (error) {
          errors.push(
            `Failed to ${operation} ${upload?.title || id}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }

      if (errors.length > 0) {
        toast({
          title: `Bulk ${operation} had errors`,
          description: errors.join("\n"),
          variant: "destructive",
        });
        throw new Error(errors.join("\n"));
      }
    },
    [downloadFile, uploads]
  );

  const handleAction = async (action: string, selectedIds: string[]) => {
    try {
      if (action === "download" || action === "delete") {
        await handleBulkOperations(
          selectedIds,
          action as "download" | "delete"
        );
        if (action === "delete") {
          router.refresh();
        }
      }
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      toast({
        title: `${action} Failed`,
        description:
          error instanceof Error ? error.message : `Failed to ${action}`,
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<Material, any>[] = [
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
        const [isDeleting, setIsDeleting] = React.useState(false);
        const fileKey = upload?.filePath || upload?.documentPath;

        const handleEdit = async (upload: Material) => {
          try {
            if (!upload?.id) {
              throw new Error("Missing document ID for editing");
            }
            router.push(`/admin/learning-materials/edit/${upload.id}`);
          } catch (error) {
            console.error("Error editing file:", error);
            toast({
              title: "Edit Failed",
              description:
                error instanceof Error ? error.message : "Failed to edit file",
              variant: "destructive",
            });
          }
        };

        const handleDownloadFile = async () => {
          try {
            if (!fileKey) {
              throw new Error("No file path available");
            }
            await downloadFile({
              fileKey,
              fileName: upload.title || getFileNameFromPath(fileKey),
            });
          } catch (error) {
            console.error("Download failed:", error);
            toast({
              title: "Download Failed",
              description:
                error instanceof Error
                  ? error.message
                  : "Failed to download file",
              variant: "destructive",
            });
          }
        };

        const deleteWithIndicator = async () => {
          setIsDeleting(true);
          try {
            await handleDelete(upload.id);
            router.refresh();
          } catch (error) {
            toast({
              title: "Delete Failed",
              description:
                error instanceof Error
                  ? error.message
                  : "Failed to delete file",
              variant: "destructive",
            });
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
              <DropdownMenuItem onClick={() => handleEdit(upload)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Document
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDownloadFile}
                disabled={!fileKey || loading === fileKey}
              >
                {loading === fileKey ? (
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
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete Document
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

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

  return (
    <SearchParamsProvider
      searchSchema={uploadsSearchParamsSchema}
      initialState={initialSearchParams}
    >
      <DataTable
        columns={columns}
        data={uploads}
        pageCount={pageCount}
        filters={initialFilters}
        onAction={handleAction}
        actionOptions={actionOptions}
      />
    </SearchParamsProvider>
  );
}
