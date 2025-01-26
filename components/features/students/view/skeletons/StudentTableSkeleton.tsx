import React from 'react';
import { Skeleton } from "@/components/ui/skeleton"

const StudentTableSkeleton: React.FC = () => {
  return (
    <div>
      <Skeleton className="h-[250px] w-full rounded-xl" />
      <div className="space-y-2 mt-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
};

export default StudentTableSkeleton;
