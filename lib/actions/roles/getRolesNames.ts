// 'use server';

// import prisma from '@/lib/db';

// interface RoleIdName {
//   id: string;
//   name: string;
// }

// export async function getRoleNamesAndIds(): Promise<RoleIdName[]> {
//   try {
//     // Fetch all roles from the database
//     const roles = await prisma.roles.findMany({
//       select: {
//         id: true,
//         name: true,
//       },
//     });

//     // Return only the id and name of each role
//     return roles.map((role) => ({
//       id: role.id,
//       name: role.name,
//     }));
//   } catch (error) {
//     console.error('Error fetching roles:', error);
//     throw new Error('Failed to fetch roles');
//   }
// }
