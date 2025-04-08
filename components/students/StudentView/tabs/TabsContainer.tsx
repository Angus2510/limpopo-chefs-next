"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResultsTab } from "./ResultsTab";
import { FinancesTab } from "./FinanceTabs";
import { DocumentsTab } from "./DocumentsTab";

interface TabsContainerProps {
  results: any[];
  finances: {
    collectedFees?: any[];
    payableFees?: any[];
  };
  documents: any[];
  studentId: string;
  intakeGroup: string;
}

export function TabsContainer({
  results,
  finances,
  documents,
  studentId,
  intakeGroup,
}: TabsContainerProps) {
  console.log("TabsContainer rendering with intakeGroup:", intakeGroup);

  return (
    <Tabs defaultValue="results">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="results">Results</TabsTrigger>
        <TabsTrigger value="finances">Finances</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
      </TabsList>

      <TabsContent value="results">
        <ResultsTab results={results} intakeGroup={intakeGroup} />
      </TabsContent>

      <TabsContent value="finances">
        <FinancesTab finances={finances} />
      </TabsContent>

      <TabsContent value="documents">
        <DocumentsTab documents={documents} studentId={studentId} />
      </TabsContent>
    </Tabs>
  );
}
