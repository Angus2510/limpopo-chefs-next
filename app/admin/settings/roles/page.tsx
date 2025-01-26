import { ContentLayout } from "@/components/layout/content-layout";
import { Suspense } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RolesTabContent from "./RolesTabContent";
import PermissionsTabContent from "./PermissionsTabContent";
import { getGroupedPermissions } from "@/lib/actions/permission/getPermissionAction";
import { getRoles } from "@/lib/actions/roles/getRoles";

import { RolesTableSkeleton } from "@/components/features/roles/roles-table-skeleton";

export default async function DashboardPage() {
  const groupedPermissions = await getGroupedPermissions();
  const roles = await getRoles();

  return (
    <ContentLayout title="Roles">
      <div className="p-6">
        <Suspense
          fallback={
            <RolesTableSkeleton
              columnCount={5}
              rowCount={10}
              searchableColumnCount={2}
              filterableColumnCount={2}
              showViewOptions={true}
              withPagination={true}
            />
          }
        >
          <Tabs defaultValue="roles">
            <TabsList>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="roles">
              <Suspense fallback={<div>Loading...</div>}>
                <RolesTabContent roles={roles} />
              </Suspense>
            </TabsContent>

            <TabsContent value="permissions">
              <Suspense fallback={<div>Loading...</div>}>
                <PermissionsTabContent permissionGroups={groupedPermissions} />
              </Suspense>
            </TabsContent>
          </Tabs>
        </Suspense>
      </div>
    </ContentLayout>
  );
}
