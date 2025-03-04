"use client";
import { useEffect, useState } from "react";
import {
  fetchStaffWithRoles,
  type StaffMember,
} from "@/lib/actions/staff/fetchStaffWithRoles";
import { fetchRoles, type Role } from "@/lib/actions/roles/fetchRoles";
import { updateStaffRoles } from "@/lib/actions/staff/updateStaffRoles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function AssignRoles() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [staffData, rolesData] = await Promise.all([
        fetchStaffWithRoles(),
        fetchRoles(),
      ]);
      setStaff(staffData);
      setRoles(rolesData);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleRoleChange = async (staffId: string, selectedRoles: string[]) => {
    try {
      const result = await updateStaffRoles(staffId, selectedRoles);
      if (result.success) {
        toast({
          title: "Success",
          description: "Roles updated successfully",
        });
        // Refresh staff data
        const updatedStaff = await fetchStaffWithRoles();
        setStaff(updatedStaff);
      } else {
        toast({
          title: "Error",
          description: "Failed to update roles",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Assign Staff Roles</h1>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Current Roles</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  {member.profile.firstName} {member.profile.lastName}
                </TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  {member.roles.map((role) => (
                    <span
                      key={role}
                      className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                    >
                      {role}
                    </span>
                  ))}
                </TableCell>
                <TableCell>
                  <Select
                    onValueChange={(value) => {
                      const selectedRoles = [...member.roles];
                      if (!selectedRoles.includes(value)) {
                        selectedRoles.push(value);
                        handleRoleChange(member.id, selectedRoles);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Add role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem
                          key={role.id}
                          value={role.roleName}
                          disabled={member.roles.includes(role.roleName)}
                        >
                          {role.roleName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {member.roles.length > 0 && (
                    <div className="mt-2">
                      {member.roles.map((role) => (
                        <Button
                          key={role}
                          variant="destructive"
                          size="sm"
                          className="mr-2 mt-2"
                          onClick={() => {
                            const updatedRoles = member.roles.filter(
                              (r) => r !== role
                            );
                            handleRoleChange(member.id, updatedRoles);
                          }}
                        >
                          Remove {role}
                        </Button>
                      ))}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
