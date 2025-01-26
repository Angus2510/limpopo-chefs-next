import prisma from '@/lib/db';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ImportantInformationProps {
  studentId: string;
}

const ImportantInformation: React.FC<ImportantInformationProps> = async ({ studentId }) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    return <div>Student not found</div>;
  }

  const { importantInformation } = student;

  return (
    <Card className="w-full h-full p-3">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-navy-700 dark:text-white">
          Important Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          className="w-full mt-2 mb-4"
          placeholder="Enter important information here"
          defaultValue={importantInformation || ''}
        />
        <Button variant="default">Save</Button>
      </CardContent>
    </Card>
  );
};

export default ImportantInformation;
