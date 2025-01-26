import AddStaffForm from '@/components/forms/staff/addStaff';
import { ContentLayout } from "@/components/layout/content-layout";
import { getRoleNamesAndIds } from '@/lib/actions/roles/getRolesNames';

export default async function AddStaffPage() {
  const roles = await getRoleNamesAndIds();

  return (
    <ContentLayout title="Add Staff">
      <AddStaffForm roles={roles} />
    </ContentLayout>
  );
}
