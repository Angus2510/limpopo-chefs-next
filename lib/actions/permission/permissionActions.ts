'use server';

import prisma from '@/lib/db';
import { PermissionSchema } from '@/schemas/permission/permissionSchema';

export async function addPermission(permissionData: PermissionSchema) {
  const { name, description, operation } = permissionData;

  // Use just the operation as the slug
  const slug = operation.toLowerCase().replace(/\s+/g, '_');

  try {
    // Create a new permission in the database
    const newPermission = await prisma.permission.create({
      data: {
        name,
        slug,
        description,
      },
    });

    console.log('Permission created:', newPermission);
    return newPermission;
  } catch (error) {
    console.error('Error creating permission:', error);
    throw new Error('Failed to create permission');
  }
}
