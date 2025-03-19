"use server";

import prisma from "@/lib/db";
import { z } from "zod";

// Define the schema for role permissions
const PermissionActionsSchema = z.object({
  view: z.boolean().default(false),
  edit: z.boolean().default(false),
  upload: z.boolean().default(false),
});

const PermissionSchema = z.object({
  page: z.string().min(1, "Page name is required"),
  actions: PermissionActionsSchema,
});

// Define the schema for the role creation form data
const RoleSchema = z.object({
  roleName: z.string().min(2, "Role name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  permissions: z.array(PermissionSchema),
});

export type RoleFormData = z.infer<typeof RoleSchema>;

export async function createRole(data: RoleFormData) {
  try {
    // Check if role already exists
    const existingRole = await prisma.roles.findFirst({
      where: {
        roleName: data.roleName,
      },
    });

    if (existingRole) {
      return {
        success: false,
        message: "A role with this name already exists",
      };
    }

    // Format permissions with proper ID structure
    const formattedPermissions = data.permissions.map((permission) => ({
      id: String(Math.random()).substring(2, 15), // Generate a unique ID for this permission
      page: permission.page,
      actions: {
        view: permission.actions.view,
        edit: permission.actions.edit,
        upload: permission.actions.upload,
      },
    }));

    // Create the role in the database
    const newRole = await prisma.roles.create({
      data: {
        roleName: data.roleName,
        description: data.description,
        permissions: formattedPermissions,
        createdAt: new Date(),
        updatedAt: new Date(),
        v: 0,
      },
    });

    console.log("Role created:", newRole);

    return {
      success: true,
      role: newRole,
    };
  } catch (error) {
    console.error("Error creating role:", error);
    return {
      success: false,
      message: "Failed to create role",
    };
  }
}

// New function to update a role
export async function updateRole(roleId: string, data: RoleFormData) {
  try {
    // Check if another role with the same name exists (excluding this role)
    const existingRole = await prisma.roles.findFirst({
      where: {
        roleName: data.roleName,
        id: { not: roleId },
      },
    });

    if (existingRole) {
      return {
        success: false,
        message: "Another role with this name already exists",
      };
    }

    // Format permissions with proper ID structure
    const formattedPermissions = data.permissions.map((permission) => ({
      id: permission.id || String(Math.random()).substring(2, 15),
      page: permission.page,
      actions: {
        view: permission.actions.view,
        edit: permission.actions.edit,
        upload: permission.actions.upload,
      },
    }));

    // Update the role in the database
    const updatedRole = await prisma.roles.update({
      where: { id: roleId },
      data: {
        roleName: data.roleName,
        description: data.description,
        permissions: formattedPermissions,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      role: updatedRole,
    };
  } catch (error) {
    console.error("Error updating role:", error);
    return {
      success: false,
      message: "Failed to update role",
    };
  }
}

// New function to delete a role
export async function deleteRole(roleId: string) {
  try {
    // Check if the role is assigned to any staff members
    const staffWithRole = await prisma.staffs.findFirst({
      where: {
        roles: {
          has: roleId,
        },
      },
    });

    if (staffWithRole) {
      return {
        success: false,
        message:
          "This role is assigned to one or more staff members and cannot be deleted",
      };
    }

    // Delete the role
    await prisma.roles.delete({
      where: { id: roleId },
    });

    return {
      success: true,
      message: "Role deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting role:", error);
    return {
      success: false,
      message: "Failed to delete role",
    };
  }
}

// Function to get a specific role by ID
export async function getRole(roleId: string) {
  try {
    const role = await prisma.roles.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return {
        success: false,
        message: "Role not found",
      };
    }

    return {
      success: true,
      role,
    };
  } catch (error) {
    console.error("Error fetching role:", error);
    return {
      success: false,
      message: "Failed to fetch role",
    };
  }
}
