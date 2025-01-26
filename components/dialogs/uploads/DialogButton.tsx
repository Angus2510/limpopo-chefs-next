'use client';

import * as React from "react";
import { Button } from "@/components/ui/button";
import { UploadDialog } from "./UploadDialog";

export function DialogButton({ intakeGroups }: { intakeGroups: { id: string; title: string }[] }) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCloseDialog = () => setIsDialogOpen(false);

  return (
    <>
      <Button onClick={handleOpenDialog} className="ml-auto">
        Upload Document
      </Button>
      <UploadDialog isOpen={isDialogOpen} onClose={handleCloseDialog} intakeGroups={intakeGroups} />
    </>
  );
}
