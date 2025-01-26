'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { mapPermissionsForRoleForm } from '@/lib/actions/permission/mapPermissionsForRoleForm';
import { createRole } from '@/lib/actions/roles/roleActions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AddRolePage() {
  const router = useRouter();
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});
  const [permissions, setPermissions] = useState<Record<string, Record<string, string[]>>>({});

  useEffect(() => {
    async function fetchPermissions() {
      try {
        const fetchedPermissions = await mapPermissionsForRoleForm();
        setPermissions(fetchedPermissions);
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
      }
    }

    fetchPermissions();
  }, []);

  const togglePermission = (entity: string, operation: string) => {
    const key = `${entity}_${operation}`;
    setSelectedPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCreateRole = async (event: React.FormEvent) => {
    event.preventDefault();
  
    // Adjust how the slugs are generated and stored in the selectedPermissions object
    const formattedPermissions = Object.keys(selectedPermissions).filter((key) => selectedPermissions[key]).map((key) => {
      const [entity, operation] = key.split('_');
      return `${operation}_${entity}`.toLowerCase(); // Reformatting to ensure consistency
    });
  
    try {
      const result = await createRole({
        name: roleName,
        description: roleDescription,
        permissions: formattedPermissions, // Use the formatted permissions
      });
  
      if (result.missingPermissions.length > 0) {
        alert(`Role created with missing permissions. Failed to add permissions for slugs: ${result.missingPermissions.join(', ')}`);
      } else {
        alert('Role created successfully.');
      }
  
      router.push('/admin/roles');
    } catch (error) {
      console.error('Failed to create role:', error);
      alert('An error occurred while creating the role.');
    }
  };
  

  const generateTables = () => {
    return Object.keys(permissions).map((category) => {
      const entities = permissions[category];

      const allOperations = Array.from(
        new Set(Object.values(entities).flat())
      );

      return (
        <div key={category} className="mt-8">
          <h2 className="text-xl font-semibold">{category}</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">Entity</TableHead>
                  {allOperations.map((operation) => (
                    <TableHead key={operation} className="text-center">
                      {operation.charAt(0).toUpperCase() + operation.slice(1)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.keys(entities).map((entity) => {
                  const operations = entities[entity];

                  return (
                    <TableRow key={entity}>
                      <TableCell>{entity}</TableCell>
                      {allOperations.map((operation) => (
                        <TableCell key={operation} className="text-center">
                          {operations.includes(operation) ? (
                            <Checkbox
                              checked={!!selectedPermissions[`${entity}_${operation}`]}
                              onCheckedChange={() => togglePermission(entity, operation)}
                              className="mx-auto"
                            />
                          ) : (
                            null // Leave empty cell for operations not available for this entity
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Role</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateRole} className="space-y-4">
            <div>
              <label>Role Name</label>
              <Input value={roleName} onChange={(e) => setRoleName(e.target.value)} required />
            </div>
            <div>
              <label>Description</label>
              <Input value={roleDescription} onChange={(e) => setRoleDescription(e.target.value)} />
            </div>

            <div>
              <label>Assign Permissions</label>
              {generateTables()}
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="submit">Create Role</Button>
              <Button variant="outline" onClick={() => router.push('/admin/roles')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
