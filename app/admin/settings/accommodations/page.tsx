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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Pencil, Trash, Plus } from "lucide-react";
import { getAllAccommodations } from "@/lib/actions/accommodation/action";

const AccommodationManager = () => {
  const [accommodations, setAccommodations] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingAccommodation, setEditingAccommodation] = useState(null);

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async () => {
    try {
      const data = await getAllAccommodations();
      setAccommodations(data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch accommodations",
        variant: "destructive",
      });
    }
  };

  const initialValues = {
    address: "",
    costPerBed: 0,
    numberOfOccupants: 0,
    occupantType: "",
    occupants: [],
    roomNumber: "",
    roomType: "",
  };

  const handleSubmit = async (values) => {
    try {
      if (editingAccommodation) {
        // Update existing accommodation
        await fetch(`/api/accommodations/${editingAccommodation.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      } else {
        // Create new accommodation
        await fetch("/api/accommodations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
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

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/accommodations/${id}`, {
        method: "DELETE",
      });
      fetchAccommodations();
      toast({
        title: "Success",
        description: "Accommodation deleted successfully",
      });
    } catch (error) {
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
            <Button onClick={() => setEditingAccommodation(null)}>
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
            <Form
              initialValues={editingAccommodation || initialValues}
              onSubmit={handleSubmit}
            >
              <div className="grid gap-4 py-4">
                <FormField
                  name="roomNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="costPerBed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost Per Bed</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="numberOfOccupants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Occupants</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="occupantType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupant Type</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="roomType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Type</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
            </Form>
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
                  onClick={() => {
                    setEditingAccommodation(accommodation);
                    setIsOpen(true);
                  }}
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
