'use client'; // Ensure this is a client component

import React from 'react';
import { Button } from '@/components/ui/button';

interface StudentSettingsActionsProps {
  action: string;
}

const StudentSettingsActions: React.FC<StudentSettingsActionsProps> = ({ action }) => {
  const handleClick = () => {
    // Placeholder for actual functionality
    if (action === 'editStudent') {
      console.log('Edit Student clicked');
    } else if (action === 'editFees') {
      console.log('Edit Fees clicked');
    } else if (action === 'disableStudent') {
      console.log('Disable Student clicked');
    } else if (action === 'sendResetLink') {
      console.log('Send Reset Link clicked');
    }
  };

  return (
    <Button
      variant="ghost"
      className={`mt-2 p-0 text-left ${
        action === 'disableStudent' ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-500' : 'text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-500'
      }`}
      onClick={handleClick}
    >
      {action === 'editStudent' && 'Edit Student'}
      {action === 'editFees' && 'Edit Fees'}
      {action === 'disableStudent' && 'Disable'}
      {action === 'sendResetLink' && 'Send Reset Link'}
    </Button>
  );
};

export default StudentSettingsActions;
