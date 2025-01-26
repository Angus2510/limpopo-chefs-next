'use server';

import prisma from '@/lib/db';
import {
  PermissionGroup,
  PERMISSION_GROUPS,
} from '@/constants/permissionGroupsTemplates';

export async function mapPermissionsForRoleForm() {
  try {
    // Fetch all permissions from the database
    const permissions = await prisma.permission.findMany();

    const mappedPermissions: Record<string, Record<string, string[]>> = {};

    // Iterate over each permission fetched from the database
    permissions.forEach((permission) => {
      // Split the slug into parts (e.g., "view_dashboard" -> ["view", "dashboard"])
      const [operation, entity] = permission.slug.split('_');

      if (!operation || !entity) return; // Skip invalid slugs

      // Find the matching group in PERMISSION_GROUPS to determine the group name
      const matchingGroup = PERMISSION_GROUPS.find((group) =>
        group.permissions.some(
          (templatePermission) => templatePermission.slug === permission.slug
        )
      );

      const groupName = matchingGroup ? matchingGroup.group : 'Uncategorized';

      // Capitalize and format the entity name (e.g., "dashboard" -> "Dashboard")
      const formattedEntity = entity
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Initialize group and entity if they don't exist
      if (!mappedPermissions[groupName]) {
        mappedPermissions[groupName] = {};
      }
      if (!mappedPermissions[groupName][formattedEntity]) {
        mappedPermissions[groupName][formattedEntity] = [];
      }

      // Add the operation to the respective entity
      mappedPermissions[groupName][formattedEntity].push(operation);
    });

    return mappedPermissions;
  } catch (error) {
    console.error('Error mapping permissions for role form:', error);
    throw new Error('Failed to map permissions for role form');
  }
}
