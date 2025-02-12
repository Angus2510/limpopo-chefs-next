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
import { Pencil, Trash, Plus } from "lucide-react";
import { getAllAccommodations } from "@/lib/actions/accommodation/action";

const AccommodationManager = () => {
  interface Accommodation {
    id: string;
    roomNumber: string;
    address: string;
    costPerBed: number;
    numberOfOccupants: number;
    occupantType: string;
    occupants: string[];
    roomType: string;
  }

  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
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

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async () => {
    try {
      const data = await getAllAccommodations();
      setAccommodations(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch accommodations",
        variant: "destructive",
      });
    }
  };

  // Open form and set initial values
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

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAccommodation) {
        // Update existing accommodation
        await fetch(`/api/accommodations/${editingAccommodation.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new accommodation
        await fetch("/api/accommodations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      setIsOpen(false);
      setEditingAccommodation(null);
      fetchAccommodations();
      toast({
        title: "Success",
        description: `Accommodation ${
          editingAccommodation ? "updated" : "created"
        } successfully`,
      });
    } catch {
      toast({
        title: "Error",
        description: `Failed to ${
          editingAccommodation ? "update" : "create"
        } accommodation`,
        variant: "destructive",
      });
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/accommodations/${id}`, { method: "DELETE" });
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
          {accommodations.map((accommodation) => (
            <TableRow key={accommodation.id}>
              <TableCell>{accommodation.roomNumber}</TableCell>
              <TableCell>{accommodation.address}</TableCell>
              <TableCell>${accommodation.costPerBed}</TableCell>
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
