// import prisma from "@/lib/db";
// import { type StaffSearchParams } from "@/types/staff/staffSearchParams";

// export const getStaffData = async (input: StaffSearchParams) => {
//   const {
//     page = 1,
//     per_page = 10,
//     sort = "username.asc",
//     search,
//     email,
//   } = input;

//   const offset = (page - 1) * per_page;
//   const [sortColumn, sortOrder] = sort.split(".") as [string, "asc" | "desc"];

//   if (!sortColumn || !sortOrder) {
//     throw new Error("Invalid sort parameter");
//   }

//   const whereConditions: any = {};

//   // Split search query into terms and search across multiple fields
//   if (search) {
//     const searchTerms = search.split(" ");
//     whereConditions.AND = searchTerms.map((term) => ({
//       OR: [
//         {
//           username: {
//             contains: term,
//             mode: "insensitive",
//           },
//         },
//         {
//           email: {
//             contains: term,
//             mode: "insensitive",
//           },
//         },
//         {
//           profile: {
//             is: {
//               firstName: {
//                 contains: term,
//                 mode: "insensitive",
//               },
//             },
//           },
//         },
//         {
//           profile: {
//             is: {
//               lastName: {
//                 contains: term,
//                 mode: "insensitive",
//               },
//             },
//           },
//         },
//         {
//           profile: {
//             is: {
//               idNumber: {
//                 contains: term,
//                 mode: "insensitive",
//               },
//             },
//           },
//         },
//       ],
//     }));
//   }

//   if (email) {
//     whereConditions.email = {
//       contains: email,
//       mode: "insensitive",
//     };
//   }

//   let orderByCondition = {};

//   if (sortColumn === "firstName" || sortColumn === "lastName") {
//     orderByCondition = {
//       profile: {
//         [sortColumn]: sortOrder,
//       },
//     };
//   } else {
//     orderByCondition = { [sortColumn]: sortOrder };
//   }

//   const data = await prisma.staffs.findMany({
//     where: whereConditions,
//     select: {
//       id: true,
//       username: true,
//       email: true,
//       profile: {
//         select: {
//           firstName: true,
//           lastName: true,
//           idNumber: true,
//         },
//       },
//     },
//     skip: offset,
//     take: per_page,
//     orderBy: orderByCondition,
//   });

//   const totalStaff = await prisma.staffs.count({ where: whereConditions });

//   const pageCount = Math.ceil(totalStaff / per_page);

//   const staff = data.map((staff) => ({
//     id: staff.id,
//     username: staff.username || "",
//     email: staff.email || "",
//     firstName: staff.profile?.firstName || "N/A",
//     lastName: staff.profile?.lastName || "N/A",
//     idNumber: staff.profile?.idNumber || "N/A",
//   }));

//   return { staff, pageCount };
// };
