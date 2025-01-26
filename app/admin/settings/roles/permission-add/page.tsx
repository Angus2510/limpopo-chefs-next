'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { permissionSchema, PermissionSchema } from '@/schemas/permission/permissionSchema';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { PERMISSION_GROUPS } from '@/constants/permissionGroupsTemplates';
import { addPermission } from '@/lib/actions/permission/permissionActions';
import { useRouter } from 'next/navigation';

export default function AddPermissionForm() {
  const router = useRouter();
  const form = useForm<PermissionSchema>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      name: '',
      description: '',
      entity: '',
      operation: '',
    },
  });

  const onSubmit = async (data: PermissionSchema) => {
    try {
      await addPermission(data);
      router.push('/admin/settings/permissions');
    } catch (error) {
      console.error('Failed to add permission:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Permission</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label>Permission Name</label>
              <Input {...form.register('name')} placeholder="Permission Name" />
            </div>
            <div>
              <label>Description</label>
              <Input {...form.register('description')} placeholder="Description" />
            </div>
            <div>
              <label>Entity</label>
              <Select onValueChange={(value) => form.setValue('entity', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Entity" />
                </SelectTrigger>
                <SelectContent>
                  {PERMISSION_GROUPS.map((group) => (
                    <SelectItem key={group.group} value={group.group}>
                      {group.group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label>Operation</label>
              <Select onValueChange={(value) => form.setValue('operation', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Operation" />
                </SelectTrigger>
                <SelectContent>
                  {PERMISSION_GROUPS.find((group) => group.group === form.watch('entity'))?.permissions.map(
                    (operation) => (
                      <SelectItem key={operation.slug} value={operation.slug}>
                        {operation.name}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="submit">Create Permission</Button>
              <Button variant="outline" onClick={() => router.push('/admin/settings/permissions')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
