"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AddStaffForm from "@/components/forms/staff/addStaff";
import { fetchRoles, type Role } from "@/lib/actions/roles/fetchRoles";
import { ContentLayout } from "@/components/layout/content-layout";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function AddStaffPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const rolesData = await fetchRoles();
        setRoles(rolesData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load roles",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    loadRoles();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ContentLayout
      title="Add Staff Member"
      description="Create a new staff member account"
      backButton={{
        href: "/admin/settings/staff",
        label: "Back to Staff List",
      }}
    >
      <div className="space-y-6">
        <AddStaffForm
          roles={roles.map((role) => ({ id: role.id, name: role.roleName }))}
        />
      </div>
    </ContentLayout>
  );
}
