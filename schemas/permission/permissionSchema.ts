// src/schemas/permissionSchema.ts
import { z } from 'zod';

export const permissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required'),
  description: z.string().optional(),
  entity: z.string().min(1, 'Entity is required'),
  operation: z.string().min(1, 'Operation is required'),
});

export type PermissionSchema = z.infer<typeof permissionSchema>;
