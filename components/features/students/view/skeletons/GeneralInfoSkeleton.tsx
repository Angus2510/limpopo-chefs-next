import React from 'react';
import { Skeleton } from "@/components/ui/skeleton"


const GeneralInfoSkeleton: React.FC = () => {
  return (
    <div>
      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      <div className="space-y-2 mt-4">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
};

export default GeneralInfoSkeleton;
