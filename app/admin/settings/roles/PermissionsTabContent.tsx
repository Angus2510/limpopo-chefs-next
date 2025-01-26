// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Plus } from "lucide-react";
// import { ColumnDef, flexRender } from "@tanstack/react-table";
// import {
//   SortingState,
//   VisibilityState,
//   ColumnFiltersState,
//   getCoreRowModel,
//   getSortedRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Input } from "@/components/ui/input";

// // Define types for permissionGroups and Permission
// interface Permission {
//   name: string;
//   slug: string;
//   description?: string;
// }

// interface PermissionGroup {
//   group: string;
//   permissions: Permission[];
// }

// interface PermissionsTabContentProps {
//   permissionGroups: PermissionGroup[];
// }

// export default function PermissionsTabContent({
//   permissionGroups,
// }: PermissionsTabContentProps) {
//   const router = useRouter();
//   const [sorting, setSorting] = useState<SortingState>([]);
//   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
//   const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
//   const [permissions, setPermissions] = useState<Permission[]>([]);

//   useEffect(() => {
//     const flattenedPermissions: Permission[] = permissionGroups.flatMap(
//       (group: PermissionGroup) =>
//         group.permissions.map((permission: Permission) => ({
//           ...permission,
//           entity: group.group,
//         }))
//     );
//     setPermissions(flattenedPermissions);
//   }, [permissionGroups]);

//   const columns: ColumnDef<Permission, any>[] = [
//     {
//       accessorKey: "entity",
//       header: "Entity",
//       enableSorting: true,
//     },
//     {
//       accessorKey: "name",
//       header: ({ column }) => (
//         <Button
//           variant="ghost"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           Permission Name
//         </Button>
//       ),
//       enableSorting: true,
//     },
//     {
//       accessorKey: "slug",
//       header: "Slug",
//       enableSorting: true,
//     },
//     {
//       accessorKey: "description",
//       header: "Description",
//       enableSorting: true,
//     },
//     {
//       id: "actions",
//       header: "Actions",
//       cell: ({ row }) => (
//         <>
//           <Button variant="outline" size="sm">
//             Edit
//           </Button>
//           <Button variant="outline" size="sm" className="ml-2">
//             Delete
//           </Button>
//         </>
//       ),
//     },
//   ];

//   const filteredData = permissions; // Modify this if you have specific filtering logic

//   const table = useReactTable({
//     data: filteredData,
//     columns,
//     state: {
//       sorting,
//       columnFilters,
//       columnVisibility,
//     },
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setColumnFilters,
//     onColumnVisibilityChange: setColumnVisibility,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//   });

//   return (
//     <div>
//       <Card className="rounded-lg border-none">
//         <CardHeader>
//           <div className="flex justify-between items-center">
//             <CardTitle>Permissions</CardTitle>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() =>
//                 router.push("/admin/settings/roles/permission-add")
//               }
//             >
//               <Plus className="mr-2 h-4 w-4" /> Add Permission
//             </Button>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center justify-between mb-4">
//             <Input
//               placeholder="Search by permission name..."
//               value={
//                 (table.getColumn("name")?.getFilterValue() as string) ?? ""
//               }
//               onChange={(event) =>
//                 table.getColumn("name")?.setFilterValue(event.target.value)
//               }
//               className="max-w-sm"
//             />
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="outline" className="ml-auto">
//                   Columns
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 {table
//                   .getAllColumns()
//                   .filter((column) => column.getCanHide())
//                   .map((column) => (
//                     <DropdownMenuCheckboxItem
//                       key={column.id}
//                       className="capitalize"
//                       checked={column.getIsVisible()}
//                       onCheckedChange={(value) =>
//                         column.toggleVisibility(!!value)
//                       }
//                     >
//                       {column.id}
//                     </DropdownMenuCheckboxItem>
//                   ))}
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>

//           <div className="rounded-md border">
//             <Table>
//               <TableHeader>
//                 {table.getHeaderGroups().map((headerGroup) => (
//                   <TableRow key={headerGroup.id}>
//                     {headerGroup.headers.map((header) => (
//                       <TableHead key={header.id}>
//                         {header.isPlaceholder
//                           ? null
//                           : flexRender(
//                               header.column.columnDef.header,
//                               header.getContext()
//                             )}
//                       </TableHead>
//                     ))}
//                   </TableRow>
//                 ))}
//               </TableHeader>
//               <TableBody>
//                 {table.getRowModel().rows?.length ? (
//                   table.getRowModel().rows.map((row) => (
//                     <TableRow key={row.id}>
//                       {row.getVisibleCells().map((cell) => (
//                         <TableCell key={cell.id}>
//                           {flexRender(
//                             cell.column.columnDef.cell,
//                             cell.getContext()
//                           )}
//                         </TableCell>
//                       ))}
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell
//                       colSpan={columns.length}
//                       className="h-24 text-center"
//                     >
//                       No results.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>

//           <div className="flex items-center justify-end space-x-2 py-4">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => table.previousPage()}
//               disabled={!table.getCanPreviousPage()}
//             >
//               Previous
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => table.nextPage()}
//               disabled={!table.getCanNextPage()}
//             >
//               Next
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
