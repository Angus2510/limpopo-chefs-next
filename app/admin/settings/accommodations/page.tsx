"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Pencil, Trash, Plus, Search } from "lucide-react";
import { Accommodation } from "@/app/api/accommodations/types/accommodations";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const AccommodationManager = () => {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingAccommodation, setEditingAccommodation] =
    useState<Accommodation | null>(null);
  const [formData, setFormData] = useState({
    roomNumber: "",
    address: "",
    costPerBed: 0,
    numberOfOccupants: 0,
    occupantType: "",
    roomType: "",
  });

  const fetchAccommodations = async () => {
    try {
      const response = await fetch("/api/accommodations");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setAccommodations(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch accommodations",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingAccommodation
        ? `/api/accommodations/${editingAccommodation.id}`
        : "/api/accommodations";

      const response = await fetch(url, {
        method: editingAccommodation ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save");

      setIsOpen(false);
      setEditingAccommodation(null);
      fetchAccommodations();
      toast({
        title: "Success",
        description: `Accommodation ${
          editingAccommodation ? "updated" : "created"
        } successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${
          editingAccommodation ? "update" : "create"
        } accommodation`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/accommodations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      fetchAccommodations();
      toast({
        title: "Success",
        description: "Accommodation deleted successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete accommodation",
        variant: "destructive",
      });
    }
  };

  const filteredAccommodations = accommodations.filter((accommodation) =>
    Object.values(accommodation).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const openForm = (accommodation: Accommodation | null) => {
    setEditingAccommodation(accommodation);
    setFormData(
      accommodation || {
        roomNumber: "",
        address: "",
        costPerBed: 0,
        numberOfOccupants: 0,
        occupantType: "",
        roomType: "",
      }
    );
    setIsOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes("cost") || name.includes("number")
          ? Number(value)
          : value,
    }));
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Accommodations</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openForm(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Accommodation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingAccommodation ? "Edit" : "Add"} Accommodation
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <Input
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                placeholder="Room Number"
                required
              />
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                required
              />
              <Input
                type="number"
                name="costPerBed"
                value={formData.costPerBed}
                onChange={handleChange}
                placeholder="Cost Per Bed"
                required
              />
              <Input
                type="number"
                name="numberOfOccupants"
                value={formData.numberOfOccupants}
                onChange={handleChange}
                placeholder="Number of Occupants"
                required
              />
              <Input
                name="occupantType"
                value={formData.occupantType}
                onChange={handleChange}
                placeholder="Occupant Type"
                required
              />
              <Input
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
                placeholder="Room Type"
                required
              />
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAccommodation ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 relative">
        <Input
          placeholder="Search accommodations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Room Number</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Cost Per Bed</TableHead>
            <TableHead>Occupants</TableHead>
            <TableHead>Room Type</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAccommodations.map((accommodation) => (
            <TableRow key={accommodation.id}>
              <TableCell>{accommodation.roomNumber}</TableCell>
              <TableCell>{accommodation.address}</TableCell>
              <TableCell>R {accommodation.costPerBed}</TableCell>
              <TableCell>{accommodation.numberOfOccupants}</TableCell>
              <TableCell>{accommodation.roomType}</TableCell>
              <TableCell className="space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => openForm(accommodation)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDelete(accommodation.id)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AccommodationManager;
