"use client";

import { useState, useEffect } from "react";
import {
  Campus,
  getAllCampuses,
  createCampus,
  updateCampus,
  deleteCampus,
} from "@/lib/actions/campus/campuses";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import CampusDialog from "./CampusDialog";

export default function CampusTable() {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null);
  const { toast } = useToast();

  const fetchCampuses = async () => {
    try {
      const data = await getAllCampuses();
      setCampuses(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch campuses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampuses();
  }, []);

  const handleSave = async (data: { title: string }) => {
    try {
      if (editingCampus) {
        await updateCampus(editingCampus.id, data);
        toast({ title: "Success", description: "Campus updated successfully" });
      } else {
        await createCampus(data);
        toast({ title: "Success", description: "Campus created successfully" });
      }
      setIsDialogOpen(false);
      fetchCampuses();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save campus",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this campus?")) {
      try {
        await deleteCampus(id);
        toast({ title: "Success", description: "Campus deleted successfully" });
        fetchCampuses();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete campus",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Campuses</h2>
        <Button
          onClick={() => {
            setEditingCampus(null);
            setIsDialogOpen(true);
          }}
        >
          Add Campus
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campuses.map((campus) => (
            <TableRow key={campus.id}>
              <TableCell>{campus.title}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingCampus(campus);
                      setIsDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(campus.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CampusDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        campus={editingCampus}
        onSave={handleSave}
      />
    </div>
  );
}
