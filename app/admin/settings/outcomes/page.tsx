"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

import { getAllOutcomes } from "@/lib/actions/intakegroup/outcome/outcomeQuery";
import {
  createOutcome,
  updateOutcome,
  deleteOutcome,
} from "@/lib/actions/intakegroup/outcome/outcomeCrud";
import { ContentLayout } from "@/components/layout/content-layout";

interface Outcome {
  id: string;
  title: string;
  type: string;
  hidden?: boolean;
}

export default function OutcomesPage() {
  const { toast } = useToast();
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    hidden: false,
  });

  const fetchOutcomes = async () => {
    try {
      const data = await getAllOutcomes();
      setOutcomes(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch outcomes",
      });
    }
  };

  useEffect(() => {
    fetchOutcomes();
  }, []);

  const handleCreate = async () => {
    try {
      await createOutcome(formData);
      toast({
        title: "Success",
        description: "Outcome created successfully",
      });
      setIsCreateOpen(false);
      fetchOutcomes();
      setFormData({ title: "", type: "", hidden: false });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create outcome",
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedOutcome) return;
    try {
      await updateOutcome(selectedOutcome.id, formData);
      toast({
        title: "Success",
        description: "Outcome updated successfully",
      });
      setIsEditOpen(false);
      fetchOutcomes();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update outcome",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this outcome?")) {
      try {
        await deleteOutcome(id);
        toast({
          title: "Success",
          description: "Outcome deleted successfully",
        });
        fetchOutcomes();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete outcome",
        });
      }
    }
  };

  const filteredAndSortedOutcomes = outcomes
    .filter(
      (outcome) =>
        outcome.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        outcome.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!!a.hidden === !!b.hidden) {
        return a.title.localeCompare(b.title);
      }
      return !!a.hidden ? 1 : -1;
    });

  return (
    <ContentLayout title="Outcomes Management">
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Outcomes Management</h1>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>Add New Outcome</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Outcome</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
                <Input
                  placeholder="Type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                />
                <div className="flex items-center justify-between">
                  <label htmlFor="hidden">Hidden</label>
                  <Switch
                    id="hidden"
                    checked={formData.hidden}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, hidden: checked })
                    }
                  />
                </div>
                <Button onClick={handleCreate}>Create Outcome</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Search outcomes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Hidden</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedOutcomes.map((outcome) => (
              <TableRow key={outcome.id}>
                <TableCell>{outcome.title}</TableCell>
                <TableCell>{outcome.type}</TableCell>
                <TableCell>{outcome.hidden ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOutcome(outcome);
                        setFormData({
                          title: outcome.title,
                          type: outcome.type,
                          hidden: outcome.hidden || false,
                        });
                        setIsEditOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(outcome.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Outcome</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              <Input
                placeholder="Type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              />
              <div className="flex items-center justify-between">
                <label htmlFor="hidden-edit">Hidden</label>
                <Switch
                  id="hidden-edit"
                  checked={formData.hidden}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, hidden: checked })
                  }
                />
              </div>
              <Button onClick={handleUpdate}>Update Outcome</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ContentLayout>
  );
}
