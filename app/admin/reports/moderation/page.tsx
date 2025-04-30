"use client";

import { useState } from "react";
import { ContentLayout } from "@/components/layout/content-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { FileText, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Define report types
const REPORT_TYPES = {
  internal: "Internal Moderation Report",
  verification: "Internal Verification Report",
  post: "Post-Moderation Report",
  qa: "QA Report by Ass Centres",
  occupational: "Internal Moderation Report (Occupational) REVIEWED v3 of 2022",
} as const;

interface Report {
  id: string;
  type: keyof typeof REPORT_TYPES;
  title: string;
  createdAt: Date;
  status: "draft" | "completed";
  campus: string;
  createdBy: string;
}

export default function ModerationReportsPage() {
  const [selectedType, setSelectedType] = useState<string>("internal");
  const [searchQuery, setSearchQuery] = useState("");
  const [reports, setReports] = useState<Report[]>([]); // This would be populated from your API

  const handleCreateNew = (type: string) => {
    // Navigate to create new report page with type
    console.log("Creating new report of type:", type);
    // router.push(`/admin/reports/moderation/create/${type}`);
  };

  return (
    <ContentLayout title="Moderation Reports">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create New Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select
              value={selectedType}
              onValueChange={(value) => setSelectedType(value)}
            >
              <SelectTrigger className="w-[500px]">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REPORT_TYPES).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => handleCreateNew(selectedType)}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Existing Reports</CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[300px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Reports</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <ReportsTable reports={reports} />
            </TabsContent>
            <TabsContent value="draft" className="mt-4">
              <ReportsTable
                reports={reports.filter((r) => r.status === "draft")}
              />
            </TabsContent>
            <TabsContent value="completed" className="mt-4">
              <ReportsTable
                reports={reports.filter((r) => r.status === "completed")}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </ContentLayout>
  );
}

function ReportsTable({ reports }: { reports: Report[] }) {
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-sm">No reports found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Campus</TableHead>
          <TableHead>Created By</TableHead>
          <TableHead>Date Created</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell className="font-medium">{report.title}</TableCell>
            <TableCell>{REPORT_TYPES[report.type]}</TableCell>
            <TableCell>{report.campus}</TableCell>
            <TableCell>{report.createdBy}</TableCell>
            <TableCell>{format(report.createdAt, "dd MMM yyyy")}</TableCell>
            <TableCell>
              <Badge
                variant={
                  report.status === "completed" ? "default" : "secondary"
                }
              >
                {report.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Button variant="outline" size="sm">
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
