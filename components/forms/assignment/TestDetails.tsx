// import React from "react";
// import { Control } from "react-hook-form";
// import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import {
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";

// interface TestDetailsProps {
//   control: Control<any>;
// }

// const TestDetails: React.FC<TestDetailsProps> = ({ control }) => (
//   <div className="space-y-4">
//     <CardHeader>
//       <CardTitle>Test Details</CardTitle>
//     </CardHeader>
//     <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//       <FormField
//         control={control}
//         name="title"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel>Title</FormLabel>
//             <Input {...field} placeholder="Test Title" />
//             <FormMessage />
//           </FormItem>
//         )}
//       />
//       <FormField
//         control={control}
//         name="description"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel>Description</FormLabel>
//             <Input {...field} placeholder="Test Description" />
//             <FormMessage />
//           </FormItem>
//         )}
//       />
//       <FormField
//         control={control}
//         name="type"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel>Type</FormLabel>
//             <Input {...field} placeholder="Test Type" />
//             <FormMessage />
//           </FormItem>
//         )}
//       />
//     </CardContent>
//   </div>
// );

// export default TestDetails;
