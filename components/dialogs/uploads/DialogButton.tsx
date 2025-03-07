"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UploadDialog } from "./UploadDialog";

export function DialogButton({
  intakeGroups,
}: {
  intakeGroups: { id: string; title: string }[];
}) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const router = useRouter();

  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCloseDialog = () => setIsDialogOpen(false);

  const handleSuccess = () => {
    router.refresh(); // This will trigger a refresh of the server components
  };

  return (
    <>
      <Button onClick={handleOpenDialog} className="ml-auto">
        Upload Document
      </Button>
      <UploadDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
        intakeGroups={intakeGroups}
      />
    </>
  );
}
