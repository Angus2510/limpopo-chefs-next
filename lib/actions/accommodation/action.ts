"use server";
import prisma from "@/lib/db";

export const getAllAccommodations = async () => {
  const accommodations = await prisma.accommodations.findMany({
    select: {
      id: true,
      roomNumber: true,
      address: true,
      roomType: true,
      costPerBed: true,
      numberOfOccupants: true,
      occupantType: true,
      occupants: true,
    },
  });

  // Combine the fields to form a title for each accommodation
  return accommodations.map((acc) => ({
    id: acc.id,
    title: `${acc.roomNumber || ""} - ${acc.address || ""} - ${
      acc.roomType || ""
    }`,
    roomNumber: acc.roomNumber,
    address: acc.address,
    roomType: acc.roomType,
    costPerBed: acc.costPerBed,
    numberOfOccupants: acc.numberOfOccupants,
    occupantType: acc.occupantType,
    occupants: acc.occupants,
  }));
};
