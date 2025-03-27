"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { use } from "react";
import { ContentLayout } from "@/components/layout/content-layout";
import { toast } from "@/components/ui/use-toast";
import EditStaffForm from "@/components/forms/staff/editStaff";
import { fetchStaffMemberById } from "@/lib/actions/staff/fetchStaffMemberById";

export default function EditStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [staffMember, setStaffMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const staffData = await fetchStaffMemberById(resolvedParams.id);
        setStaffMember(staffData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load staff member data",
          variant: "destructive",
        });
        router.push("/admin/settings/staff");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [resolvedParams.id, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!staffMember) {
    return <div>Staff member not found</div>;
  }

  return (
    <ContentLayout
      title="Edit Staff Member"
      backButton={{
        href: "/admin/settings/staff",
        label: "Back to Staff List",
      }}
    >
      <div className="space-y-6">
        <EditStaffForm staffMember={staffMember} />
      </div>
    </ContentLayout>
  );
}
