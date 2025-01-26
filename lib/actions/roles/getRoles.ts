// "use server";

// import prisma from "@/lib/db";

// interface Role {
//   name: string;
//   description: string;
//   permissions: string[];
// }

// export async function getRoles(): Promise<Role[]> {
//   try {
//     // Fetch all roles from the database
//     const roles = await prisma.roles.findMany();

//     // Fetch all permissions to map them by ID
//     const allPermissions = await prisma.permissions.findMany();
//     const permissionMap = new Map<string, string>();
//     allPermissions.forEach((permission) => {
//       permissionMap.set(permission.id, permission.slug);
//     });

//     // Map the roles to the required format
//     const formattedRoles: Role[] = roles.map((role) => {
//       const permissions = role.permissions.map((permissionId) => {
//         // Map each permission ID to its corresponding slug
//         return permissionMap.get(permissionId) || "unknown_permission";
//       });

//       return {
//         name: role.name,
//         description: role.description || "",
//         permissions: permissions,
//       };
//     });

//     return formattedRoles;
//   } catch (error) {
//     console.error("Error fetching roles:", error);
//     throw new Error("Failed to fetch roles");
//   }
// }
