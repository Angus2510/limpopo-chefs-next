import { getAssignments } from "@/lib/actions/assignments/getAssignments";
import AssignmentsList from "@/components/assignments/AssignmentsList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { ContentLayout } from "@/components/layout/content-layout";

export default async function AssignmentsPage() {
  const assignments = (await getAssignments()) || [];

  return (
    <ContentLayout title="Assignments">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Assignments</h1>
          <Link href="/admin/assignment/create">
            <Button>Create New Assignment</Button>
          </Link>
        </div>
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">
                Loading assignments...
              </div>
            </div>
          }
        >
          <AssignmentsList assignments={assignments} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
