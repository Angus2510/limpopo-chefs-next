// // src/lib/actions/createRole.ts
// 'use server';

// import prisma from '@/lib/db';
// import { z } from 'zod';

// // Define the schema for the role creation form data
// const RoleSchema = z.object({
//   name: z.string().min(1, 'Role name is required'),
//   description: z.string().optional(),
//   permissions: z.array(z.string()), // Array of permission slugs
// });

// export async function createRole(data: z.infer<typeof RoleSchema>) {
//   const { name, description, permissions } = data;

//   // Track missing permissions
//   const missingPermissions: string[] = [];

//   // Find permissions by slug
//   const permissionIds: string[] = await Promise.all(
//     permissions.map(async (slug) => {
//       const permission = await prisma.permission.findUnique({
//         where: { slug },
//         select: { id: true },
//       });

//       if (permission) {
//         return permission.id;
//       } else {
//         missingPermissions.push(slug); // Track missing slug
//         return null;
//       }
//     })
//   ).then((results) => results.filter((id) => id !== null) as string[]);

//   try {
//     // Create the role in the database
//     const newRole = await prisma.role.create({
//       data: {
//         name,
//         description,
//         permissions: permissionIds,
//       },
//     });

//     console.log('Role created:', newRole);

//     if (missingPermissions.length > 0) {
//       console.warn(
//         `Failed to add permissions for the following slugs: ${missingPermissions.join(
//           ', '
//         )}`
//       );
//       return { role: newRole, missingPermissions };
//     }

//     return { role: newRole, missingPermissions: [] };
//   } catch (error) {
//     console.error('Error creating role:', error);
//     throw new Error('Failed to create role');
//   }
// }
