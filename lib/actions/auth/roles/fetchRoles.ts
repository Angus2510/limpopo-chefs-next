// import prisma from '@/lib/db'; // Ensure you have the Prisma client configured

// export async function fetchUserRoles(userId: string, userType: string) {
//   if (userType !== 'Staff') {
//     throw new Error('Unsupported user type');
//   }

//   // Fetch user roles from the UserRole model
//   const userRoles = await prisma.userRole.findUnique({
//     where: { userId },
//     select: {
//       roleIds: true, // Fetch only the roleIds field
//     },
//   });

//   // If no roles are found, return empty arrays for roles and permissions
//   if (!userRoles) {
//     return {
//       roles: [],
//       permissions: [],
//     };
//   }

//   // Fetch role details from the Role model
//   const roles = await prisma.role.findMany({
//     where: {
//       id: { in: userRoles.roleIds },
//     },
//   });

//   // Collect all unique permission IDs from roles
//   const permissionIds = new Set(roles.flatMap((role) => role.permissions));

//   // Fetch permission details from the Permission model
//   const permissions = await prisma.permission.findMany({
//     where: {
//       id: { in: Array.from(permissionIds) }, // Convert Set to Array
//     },
//   });

//   // Map roles and permissions to their names
//   const roleNames = roles.map((role) => role.name);
//   const permissionNames = permissions.map((permission) => permission.slug);

//   return {
//     roles: roleNames.length > 0 ? roleNames : [], // Ensure roles is an empty array if no roles
//     permissions: permissionNames.length > 0 ? permissionNames : [], // Ensure permissions is an empty array if no permissions
//   };
// }
