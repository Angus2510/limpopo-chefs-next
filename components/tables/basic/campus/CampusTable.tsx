// 'use client';

// import * as React from 'react';
// import { ColumnDef } from '@tanstack/react-table';
// import { useRouter } from 'next/navigation';
// import { SearchParamsProvider } from '../SearchParamsProvider';
// import { DataTable } from '../DataTable';
// import { campusSearchParamsSchema } from './campusSearchParams';
// import { Button } from '@/components/ui/button';
// // import { Filter } from '@/types/tables/basic/filterTypes';

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { MoreHorizontal } from 'lucide-react';

// interface CampusTableProps {
//   campus: any[];
//   pageCount: number;
//   initialSearch: any;
// }

// // Let TypeScript infer the router type
// const columns = (router: ReturnType<typeof useRouter>): ColumnDef<any, any>[] => [
//   {
//     accessorKey: 'title',
//     header: 'title',
//     enableSorting: true,
//   },
//   {
//     id: 'actions',
//     header: 'Actions',
//     cell: ({ row }) => {
//       const staff = row.original;
//       const viewStaff = () => {
//         router.push(`/admin/staff/${staff.id}`);
//       };
//       return (
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="ghost" className="h-8 w-8 p-0">
//               <span className="sr-only">Open menu</span>
//               <MoreHorizontal className="h-4 w-4" />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end">
//             <DropdownMenuLabel>Actions</DropdownMenuLabel>
//             <DropdownMenuItem onClick={() => navigator.clipboard.writeText(staff.id)}>
//               Copy Staff ID
//             </DropdownMenuItem>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem onClick={viewStaff}>View Staff</DropdownMenuItem>
//             <DropdownMenuItem onClick={() => navigator.clipboard.writeText(staff.id)}>Edit Staff</DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       );
//     },
//   },
// ];

// export function CampusTable({ campus, pageCount, initialSearch }: CampusTableProps) {
//   const router = useRouter();
//   const initialSearchParams = {
//     page: initialSearch.page ?? 1,
//     per_page: initialSearch.per_page ?? 10,
//     sort: initialSearch.sort ?? '',
//     search: initialSearch.search ?? '',
//   };

//   return (
//     <SearchParamsProvider searchSchema={campusSearchParamsSchema} initialState={initialSearchParams}>
//       <DataTable columns={columns(router)} data={campus} pageCount={pageCount} filters={[]} />
//     </SearchParamsProvider>
//   );
// }
