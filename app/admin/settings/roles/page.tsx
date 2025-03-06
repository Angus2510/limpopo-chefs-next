"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { PlusCircle } from "lucide-react";

export default function AssignRoles() {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [staffData, rolesData] = await Promise.all([
          fetchStaffWithRoles(),
          fetchRoles(),
        ]);
        setStaff(staffData);
        setRoles(rolesData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        });
        setLoading(false);
      }
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
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Role Management</h2>
          <p className="text-muted-foreground">
            Manage staff roles and permissions
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/settings/roles/new")}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          New Role
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Current Roles</TableHead>
              <TableHead className="w-[300px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  {member.profile?.firstName} {member.profile?.lastName}
                </TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {member.roles.map((roleId) => {
                      const role = roles.find((r) => r.id === roleId);
                      return (
                        <span
                          key={roleId}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                        >
                          {role?.roleName || roleId}
                        </span>
                      );
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <Select
                      onValueChange={(value) => {
                        const selectedRoles = [...member.roles];
                        if (!selectedRoles.includes(value)) {
                          selectedRoles.push(value);
                          handleRoleChange(member.id, selectedRoles);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Add role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem
                            key={role.id}
                            value={role.id}
                            disabled={member.roles.includes(role.id)}
                          >
                            {role.roleName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {member.roles.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {member.roles.map((roleId) => {
                          const role = roles.find((r) => r.id === roleId);
                          return (
                            <Button
                              key={roleId}
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const updatedRoles = member.roles.filter(
                                  (r) => r !== roleId
                                );
                                handleRoleChange(member.id, updatedRoles);
                              }}
                            >
                              Remove {role?.roleName || roleId}
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
