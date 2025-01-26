// // src/pages/admin/staff/index.tsx

// import { ContentLayout } from "@/components/layout/content-layout";
// import { getStaffData } from "@/lib/actions/staff/staffQuery";
// import { StaffTable } from "@/components/tables/basic/staff/StaffTable";
// import { DataTableSkeleton } from "@/components/tables/basic/data-table-skeleton";
// import * as React from "react";
// import {
//   staffSearchParamsSchema,
//   StaffSearchParams,
// } from "@/types/staff/staff";

// import { Card, CardContent } from "@/components/ui/card";

// interface IndexPageProps {
//   searchParams: Partial<StaffSearchParams>;
// }

// export default async function Staff({ searchParams }: IndexPageProps) {
//   // Explicitly await and safely parse search parameters
//   const parseResult = await staffSearchParamsSchema.safeParseAsync(
//     searchParams
//   );

//   if (!parseResult.success) {
//     console.error("Staff Search Params Validation Failed:", parseResult.error);

//     // Fallback to default search parameters
//     const defaultSearch: StaffSearchParams = {
//       page: 1,
//       per_page: 10,
//     };

//     const { staff, pageCount } = await getStaffData(defaultSearch);

//     return (
//       <ContentLayout title="Staff">
//         <div className="text-yellow-600">
//           Warning: Invalid search parameters. Showing default results.
//         </div>
//         <StaffTable
//           staff={staff}
//           pageCount={pageCount}
//           initialSearch={defaultSearch}
//         />
//       </ContentLayout>
//     );
//   }

//   const search = parseResult.data;
//   const { staff, pageCount } = await getStaffData(search);

//   return (
//     <ContentLayout title="Staff">
//       <Card className="rounded-lg border-none">
//         <CardContent className="p-6">
//           <React.Suspense
//             fallback={
//               <DataTableSkeleton
//                 columnCount={5}
//                 searchableColumnCount={1}
//                 filterableColumnCount={0}
//                 cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem"]}
//                 shrinkZero
//               />
//             }
//           >
//             <StaffTable
//               staff={staff}
//               pageCount={pageCount}
//               initialSearch={search}
//             />
//           </React.Suspense>
//         </CardContent>
//       </Card>
//     </ContentLayout>
//   );
// }
