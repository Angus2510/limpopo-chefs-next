'use server';

import prisma from '@/lib/db';
import {
  PERMISSION_GROUPS,
  PermissionGroup,
} from '@/constants/permissionGroupsTemplates';

export async function getGroupedPermissions(): Promise<PermissionGroup[]> {
  try {
    // Fetch all permissions from the database
    const permissions = await prisma.permission.findMany();

    // Create a map of existing groups based on the PERMISSION_GROUPS template
    const groupedPermissionsMap: { [key: string]: PermissionGroup } = {};

    PERMISSION_GROUPS.forEach((templateGroup) => {
      groupedPermissionsMap[templateGroup.group] = {
        group: templateGroup.group,
        permissions: [],
      };
    });

    // Iterate over each permission fetched from the database
    permissions.forEach((permission) => {
      // Find the group in the template that matches the permission's slug
      const matchingGroup = PERMISSION_GROUPS.find((group) =>
        group.permissions.some(
          (templatePermission) => templatePermission.slug === permission.slug
        )
      );

      // If a matching group is found, add the permission to it
      if (matchingGroup) {
        groupedPermissionsMap[matchingGroup.group].permissions.push({
          slug: permission.slug,
          name: permission.name,
        });
      } else {
        // If no matching group is found, log a warning and add the permission to a general group (optional)
        console.warn(
          `No matching group found for permission slug: ${permission.slug}`
        );
        if (!groupedPermissionsMap['Uncategorized']) {
          groupedPermissionsMap['Uncategorized'] = {
            group: 'Uncategorized',
            permissions: [],
          };
        }
        groupedPermissionsMap['Uncategorized'].permissions.push({
          slug: permission.slug,
          name: permission.name,
        });
      }
    });

    // Convert the grouped permissions map to an array
    const groupedPermissions: PermissionGroup[] = Object.values(
      groupedPermissionsMap
    );

    return groupedPermissions;
  } catch (error) {
    console.error('Error fetching grouped permissions:', error);
    throw new Error('Failed to fetch grouped permissions');
  }
}
