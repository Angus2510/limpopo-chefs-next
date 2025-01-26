import EditStaffForm from '@/components/forms/staff/editStaff';
import { getRoleNamesAndIds } from '@/lib/actions/roles/getRolesNames';
import prisma from '@/lib/db';
import { ContentLayout } from "@/components/layout/content-layout";

interface EditStaffPageParams {
  id: string;
}

export default async function EditStaffPage({ params }: { params: EditStaffPageParams }) {
  const roles = await getRoleNamesAndIds(); 

  const staff = await prisma.staff.findUnique({
    where: { id: params.id },
    include: { profile: true },
  });

  const userRoles = await prisma.userRole.findUnique({
    where: { userId: params.id },
  });

  if (!staff) {
    return <div>Staff not found</div>;
  }

  return (
  <ContentLayout title="Edit Staff">
    <EditStaffForm
      staff={staff}
      roles={roles}
      userRoles={userRoles?.roleIds || []} 
    />
   </ContentLayout>
  );
}
