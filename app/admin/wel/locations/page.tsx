"use client";
import React, { useState, useEffect } from "react";
import {
  createWel,
  getWels,
  updateWel,
  deleteWel,
} from "@/lib/actions/wels/establishments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { ImageUpload } from "@/components/wels/ImageUpload";

interface WEL {
  id: string;
  title: string;
  location: string;
  description?: string;
  accommodation: boolean;
  available: boolean;
  note?: string;
  photoPath: string[];
  dateUploaded: Date;
  v: number;
}

export default function WELPage() {
  const { toast } = useToast();
  const [wels, setWels] = useState<WEL[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [welToDelete, setWelToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    description: "",
    accommodation: false,
    available: true,
    note: "",
    photoPath: [] as string[],
  });

  useEffect(() => {
    fetchWels();
  }, []);

  const fetchWels = async () => {
    try {
      const data = await getWels();
      if (data) {
        setWels(data);
      }
    } catch (error) {
      console.error("Error fetching WELs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch WEL locations",
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateWel(editingId, formData);
        toast({
          title: "Success",
          description: "WEL location updated successfully",
        });
        setEditingId(null);
      } else {
        await createWel(formData);
        toast({
          title: "Success",
          description: "WEL location added successfully",
        });
      }
      setFormData({
        title: "",
        location: "",
        description: "",
        accommodation: false,
        available: true,
        note: "",
        photoPath: [],
      });
      fetchWels();
    } catch (error) {
      console.error("Error saving WEL:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save WEL location",
      });
    }
  };

  const handleEdit = (wel: WEL) => {
    setEditingId(wel.id);
    setFormData({
      title: wel.title,
      location: wel.location,
      description: wel.description || "",
      accommodation: wel.accommodation,
      available: wel.available,
      note: wel.note || "",
      photoPath: wel.photoPath,
    });
  };

  const handleDelete = async (id: string) => {
    if (!id) return;

    try {
      const result = await deleteWel(id);
      if (result && result.success) {
        toast({
          title: "Success",
          description: "WEL location deleted successfully",
        });
        setIsDeleteDialogOpen(false);
        setWelToDelete(null);
        fetchWels();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete WEL location",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete WEL location",
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold">WEL Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit" : "Add New"} WEL Location</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="accommodation"
                  checked={formData.accommodation}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("accommodation", checked as boolean)
                  }
                />
                <label htmlFor="accommodation" className="text-sm font-medium">
                  Accommodation Available
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("available", checked as boolean)
                  }
                />
                <label htmlFor="available" className="text-sm font-medium">
                  Currently Available
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Images</label>
              <ImageUpload
                value={formData.photoPath}
                onChange={(urls) =>
                  setFormData((prev) => ({ ...prev, photoPath: urls }))
                }
                onRemove={(url) =>
                  setFormData((prev) => ({
                    ...prev,
                    photoPath: prev.photoPath.filter((item) => item !== url),
                  }))
                }
              />
            </div>

            <Button type="submit" className="w-full">
              {editingId ? "Update" : "Add"} WEL Location
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing WEL Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {wels.map((wel) => (
              <Card key={wel.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{wel.title}</h3>
                      <p className="text-muted-foreground">{wel.location}</p>
                      {wel.description && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {wel.description}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(wel)}
                      >
                        Edit
                      </Button>
                      <Dialog
                        open={isDeleteDialogOpen && welToDelete === wel.id}
                        onOpenChange={(open) => {
                          setIsDeleteDialogOpen(open);
                          if (!open) setWelToDelete(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setWelToDelete(wel.id)}
                          >
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this WEL location?
                              This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => setIsDeleteDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDelete(wel.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        wel.available
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {wel.available ? "Available" : "Not Available"}
                    </span>
                    {wel.accommodation && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Accommodation Available
                      </span>
                    )}
                  </div>
                  {wel.note && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      {wel.note}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
