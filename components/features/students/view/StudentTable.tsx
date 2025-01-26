import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentsTable from './tables/DocumentsTable';
import WellnessResultsTable from './tables/WellnessResultsTable';
import TestsTasksTable from './tables/WellnessResultsTable';

interface StudentTablesProps {
  studentId: string;
}

const StudentTables: React.FC<StudentTablesProps> = ({ studentId }) => {
  return (
    <Tabs defaultValue="documents" className="w-full h-full">
      <TabsList className="flex space-x-2">
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="wellnessResults">Wellness Results</TabsTrigger>
        <TabsTrigger value="testsTasks">Tests/Tasks</TabsTrigger>
      </TabsList>
      <TabsContent value="documents">
        <DocumentsTable studentId={studentId} />
      </TabsContent>
      <TabsContent value="wellnessResults">
        <WellnessResultsTable studentId={studentId} />
      </TabsContent>
      <TabsContent value="testsTasks">
        <TestsTasksTable studentId={studentId} />
      </TabsContent>
    </Tabs>
  );
};

export default StudentTables;
