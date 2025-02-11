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
import axios from "axios";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface UploadsTableProps {
  uploads: any[];
  pageCount: number;
  initialSearch: any;
  intakeGroups: { id: string; title: string }[];
}

// Define table columns
const columns = (
  router: ReturnType<typeof useRouter>
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
      const uploads = row.original;

      // Function to view file
      const viewFile = async () => {
        try {
          const response = await fetch(
            `/api/admin/learning-materials/view?id=${uploads.id}`
          );
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, "_blank"); // Open in a new tab
          } else {
            console.error("Failed to view document:", response.statusText);
          }
        } catch (error) {
          console.error("Error viewing document:", error);
        }
      };

      // Function to delete a single file
      const deleteFile = async () => {
        if (!confirm("Are you sure you want to delete this file?")) return;

        try {
          const response = await fetch(
            `/api/admin/learning-materials/delete?id=${uploads.id}`,
            {
              method: "DELETE",
            }
          );

          if (response.ok) {
            alert("File deleted successfully");
            router.refresh(); // Refresh table after deletion
          } else {
            console.error("Failed to delete file:", response.statusText);
          }
        } catch (error) {
          console.error("Error deleting file:", error);
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
              onClick={() => navigator.clipboard.writeText(uploads.id)}
            >
              Copy File ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={viewFile}>View File</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(uploads.id)}
            >
              Edit Document
            </DropdownMenuItem>
            <DropdownMenuItem onClick={deleteFile} className="text-red-500">
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
      try {
        const response = await axios.post(
          "/api/admin/learning-materials/download",
          {
            ids: selectedIds,
          },
          { responseType: "blob" }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;

        const contentDisposition = response.headers["content-disposition"];
        let fileName = "downloaded_file";

        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
          if (fileNameMatch.length > 1) {
            fileName = fileNameMatch[1];
          }
        }

        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error downloading the file(s):", error);
      }
    }

    if (action === "delete") {
      if (
        !confirm(
          `Are you sure you want to delete ${selectedIds.length} file(s)?`
        )
      )
        return;

      try {
        const response = await axios.post(
          "/api/admin/learning-materials/delete-multiple",
          { ids: selectedIds }
        );

        if (response.status === 200) {
          alert("Files deleted successfully");
          router.refresh(); // Refresh table after deletion
        } else {
          console.error("Failed to delete files:", response.statusText);
        }
      } catch (error) {
        console.error("Error deleting files:", error);
      }
    }
  };

  return (
    <SearchParamsProvider
      searchSchema={uploadsSearchParamsSchema}
      initialState={initialSearchParams}
    >
      <DataTable
        columns={columns(router)}
        data={uploads}
        pageCount={pageCount}
        filters={initialFilters}
        onAction={handleAction}
        actionOptions={actionOptions}
      />
    </SearchParamsProvider>
  );
}
