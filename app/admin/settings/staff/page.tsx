"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus } from "lucide-react";
import {
  fetchStaffWithRoles,
  type StaffMember,
} from "@/lib/actions/staff/fetchStaffWithRoles";
import { fetchRoles, type Role } from "@/lib/actions/roles/fetchRoles";
import { deleteStaffMember } from "@/lib/actions/staff/deleteStaffMember";
import { ContentLayout } from "@/components/layout/content-layout";
import { toast } from "@/components/ui/use-toast";

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
          description: "Failed to load staff data",
          variant: "destructive",
        });
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getRoleName = (roleId: string) => {
    // Changed the comparison to match by id instead of roleName
    const role = roles.find((r) => r.id === roleId);
    return role?.roleName || roleId;
  };

  const handleDelete = async (staffId: string, staffName: string) => {
    if (
      confirm(
        `Are you sure you want to delete ${staffName}? This action cannot be undone.`
      )
    ) {
      try {
        const result = await deleteStaffMember(staffId);
        if (result.success) {
          toast({
            title: "Staff member deleted",
            description: `${staffName} has been successfully deleted.`,
          });
          const updatedStaff = await fetchStaffWithRoles();
          setStaff(updatedStaff);
        } else {
          toast({
            title: "Error",
            description: "Failed to delete staff member",
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
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ContentLayout title="Staff Management">
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => router.push("/admin/settings/staff/add")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Staff Member
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
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
                  <div className="flex flex-wrap gap-1">
                    {member.roles.map((roleId) => (
                      <span
                        key={roleId}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {getRoleName(roleId)}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      member.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {member.active ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/admin/settings/staff/edit/${member.id}`)
                        }
                      >
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(
                            `/admin/settings/staff/roles/${member.id}`
                          )
                        }
                      >
                        Manage Roles
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(
                            `/admin/settings/staff/permissions/${member.id}`
                          )
                        }
                      >
                        Set Permissions
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() =>
                          handleDelete(
                            member.id,
                            `${member.profile.firstName} ${member.profile.lastName}`
                          )
                        }
                      >
                        Delete Staff
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ContentLayout>
  );
}
