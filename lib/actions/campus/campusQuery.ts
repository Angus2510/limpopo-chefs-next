// import prisma from '@/lib/db';
// import { type CampusSearchParams } from '@/types/campus/campusSearchParams';

// export const getCampusData = async (input: CampusSearchParams) => {
//   const { page = 1, per_page = 10, sort = 'username.asc', search } = input;

//   const offset = (page - 1) * per_page;
//   const [sortColumn, sortOrder] = sort.split('.') as [string, 'asc' | 'desc'];

//   if (!sortColumn || !sortOrder) {
//     throw new Error('Invalid sort parameter');
//   }

//   const whereConditions: any = {};

//   // Split search query into terms and search across multiple fields
//   if (search) {
//     const searchTerms = search.split(' ');
//     whereConditions.AND = searchTerms.map((term) => ({
//       OR: [
//         {
//           title: {
//             contains: term,
//             mode: 'insensitive',
//           },
//         },
//       ],
//     }));
//   }

//   let orderByCondition = {};

//   orderByCondition = { [sortColumn]: sortOrder };

//   const data = await prisma.campus.findMany({
//     where: whereConditions,
//     select: {
//       id: true,
//       title: true,
//     },
//     skip: offset,
//     take: per_page,
//     orderBy: orderByCondition,
//   });

//   const totalCampus = await prisma.campus.count({ where: whereConditions });

//   const pageCount = Math.ceil(totalCampus / per_page);

//   const campus = data.map((campus) => ({
//     id: campus.id,
//     title: campus.title || '',
//   }));

//   return { campus, pageCount };
// };
